import { Animations } from '../gameEngine/Animations';
import { FrameIndexPattern } from '../gameEngine/animations/FrameIndexPattern';
import { DOWN, LEFT, RIGHT, STATE_DEAD, STATE_EXPIRED, STATE_GAMEOVER, STATE_INITIAL, STATE_LAUNCHING, UP } from '../constants';
import { GameObject } from '../gameEngine/GameObject';
import { resources } from '../Resources';
import { Sprite } from '../gameEngine/Sprite';
import { CardinalVectors, spriteSize, Vector2 } from '../utils/vector';
import {
  DEATH,
  EXPIRED,
  IDLE_START,
  IMPENDING_DOOM_DOWN,
  IMPENDING_DOOM_LEFT,
  IMPENDING_DOOM_RIGHT,
  IMPENDING_DOOM_UP,
  LAUNCH,
  MOVE_DOWN,
  MOVE_LEFT,
  MOVE_RIGHT,
  MOVE_UP,
} from './slimeAnimations';
import { calculateCollision, moveTowards } from '../utils/moveUtils';
import { gameEvents } from '../events/Events';
import type { Main } from '../gameEngine/Main';
import type { Direction, GameStateType, Movement } from '../types';
import { signals } from '../events/eventConstants';
import { Ramp } from '../objects/Obstacles/Ramp';
import { Paddle } from '../objects/Paddle/Paddle';
import { AfterImage } from './AfterImage';
import type { Pinball } from '../levels/Pinball';
import { gameState } from '../game/GameState';
import { ItemCollectionShell } from '../objects/Item/ItemCollectionShell';
import { gridCells } from '../utils/grid';


export class Slime extends GameObject {
  facingDirection: Direction;
  destinationPosition: Vector2;
  body: Sprite;
  paddle: Paddle | null | undefined;
  speed: number;
  afterImage: AfterImage;
  deathThroes: Sprite;
  itemPickupShell: ItemCollectionShell;
  isLocked: boolean = false;
  isTurning: boolean = false;
  gizmo: Sprite;
  isLevelBuilding: boolean = false;
  lastPaddleCollisionTime: number = -Infinity;

  debugExpired: number = 0;

  constructor(position: Vector2, speed: number = 4) {
    super(position);

    this.speed = speed;
    this.name = 'slime';

    this.body = new Sprite({
      resource: resources.images.hero,
      frameSize: spriteSize,
      frameColumns: 6,
      frameRows: 6,
      frameIndex: 1,
      position: new Vector2(0, -1),
      animations: new Animations({
        idle: new FrameIndexPattern(IDLE_START),
        launch: new FrameIndexPattern(LAUNCH),
        moveDown: new FrameIndexPattern(MOVE_DOWN),
        moveUp: new FrameIndexPattern(MOVE_UP),
        moveLeft: new FrameIndexPattern(MOVE_LEFT),
        moveRight: new FrameIndexPattern(MOVE_RIGHT),
        expired: new FrameIndexPattern(EXPIRED),
        doomUp: new FrameIndexPattern(IMPENDING_DOOM_UP),
        doomRight: new FrameIndexPattern(IMPENDING_DOOM_RIGHT),
        doomDown: new FrameIndexPattern(IMPENDING_DOOM_DOWN),
        doomLeft: new FrameIndexPattern(IMPENDING_DOOM_LEFT),
      }),
    });

    this.itemPickupShell = new ItemCollectionShell();

    this.gizmo = new Sprite({
      resource: resources.images['gizmo'],
      frameSize: spriteSize,
      position: Vector2.Zero()
    });

    this.afterImage = new AfterImage();

    this.addChild(this.body);
    this.addChild(this.afterImage);
    this.addChild(this.itemPickupShell);

    this.deathThroes = new Sprite({
      resource: resources.images['slimeDeath'],
      frameSize: new Vector2(128, 128),
      frameColumns: 8,
      frameRows: 7,
      alwaysDraw: true,
      position: new Vector2(-64, -112),
      animations: new Animations(
        { death: new FrameIndexPattern(DEATH), }
      )
    });

    this.facingDirection = RIGHT;
    this.destinationPosition = this.position.duplicate();
  }

  ready(): void {
    gameEvents.on<Vector2>(signals.gameAction, this, (_) => {
      this.redirect();
    });

    gameEvents.on<GameStateType>(signals.stateChanged, this, (value) => {
      if (value === STATE_INITIAL) {
        this.body.animations?.play('idle');
      }
      else if (value === STATE_LAUNCHING) {
        this.destinationPosition.x += 32;
        this.body.animations?.playOnce('launch', () => {
          this.body.animations?.play('moveRight');
        });
      }
      else if (value === STATE_EXPIRED) {
        this.afterImage.clearShadows();
        this.body.animations?.playOnce('expired', () => {
          this.body.isVisible = false;
        });
      }
      else if (value === STATE_DEAD) {
        this.afterImage.clearShadows();
        this.body.isVisible = false;
        this.addChild(this.deathThroes);
        this.deathThroes.animations?.playOnce('death', () => this.removeChild(this.deathThroes));
      }
      else if (value === STATE_GAMEOVER) {
        this.body.isVisible = false;
        this.isLocked = true;
        this.itemPickupShell?.destroy();

        gameEvents.unsubscribe(this)
        if (this.isLevelBuilding) {
          this.addChild(this.gizmo);
          gameEvents.on<Direction>(signals.arrowMovement, this, (value) => {
            this.position = this.position.add(CardinalVectors[value].multiply(16));
            this.destinationPosition = this.position;
            gameEvents.emit(signals.slimePosition, { position: this.position });
          });
        }
      }
    });
  }

  step(_deltaTime: number, root: Main) {
    const { input } = root;
    if (input.getActionJustPressed('Space') && this.paddle) {
      this.redirect()
    }

    if (gameState.current === STATE_LAUNCHING) {
      const inertiaStep = LAUNCH.duration - LAUNCH.frames[4].time;
      const stateTime = gameState.getStepTime();
      if (stateTime < inertiaStep) {
        moveTowards(this.position, this.destinationPosition, this.speed)
      }
      return;
    }

    if (gameState.isPlaying) {
      const distance = moveTowards(this.position, this.destinationPosition, this.speed);
      this.checkForPaddle();

      const hasArrived = distance < 1;

      if (hasArrived) {
        this.tryMove(root);
      }
    }

    if (gameState.current !== STATE_GAMEOVER)
      gameEvents.emit(signals.slimePosition, { position: this.position, direction: this.facingDirection } as Movement);
  }

  tryMove(root: Main) {
    if (this.isLocked || root.isFading) return;

    if (!gameState.isPlaying) {
      return;
    }

    let nextX = this.destinationPosition.x;
    let nextY = this.destinationPosition.y;

    const gridSize = 16;

    if (this.facingDirection === UP) {
      nextY -= gridSize;
      const animationType = this.checkUpcomingObstacles();
      this.body.animations?.play(`${animationType}Up`);
    }

    if (this.facingDirection === DOWN) {
      nextY += gridSize;
      const animationType = this.checkUpcomingObstacles();
      this.body.animations?.play(`${animationType}Down`);
    }

    if (this.facingDirection === LEFT) {
      nextX -= gridSize;
      const animationType = this.checkUpcomingObstacles();
      this.body.animations?.play(`${animationType}Left`);
    }

    if (this.facingDirection === RIGHT) {
      nextX += gridSize;
      const animationType = this.checkUpcomingObstacles();
      this.body.animations?.play(`${animationType}Right`);
    }

    const destination = new Vector2(nextX, nextY);

    const destinationTile = this.parent?.children.filter((child) => {
      return child.position.equals(destination);
    });
    const isObstruction = destinationTile?.some(tile => tile.isSolid);
    const ramp = destinationTile?.find((tile): tile is Ramp => tile instanceof Ramp) as Ramp | undefined;

    if (isObstruction) {
      gameState.kill();
      return;
    }
    if (ramp) {
      this.turn(ramp, () => gameState.kill());
    }

    this.destinationPosition = destination;
  }

  checkForPaddle() {
    const nearbyPaddles = (this.parent as Pinball).paddles.filter((paddle) => {
      if (this.facingDirection === RIGHT) return paddle.position.x > this.position.x && paddle.position.y === this.position.y;
      if (this.facingDirection === LEFT) return paddle.position.x < this.position.x && paddle.position.y === this.position.y;
      if (this.facingDirection === DOWN) return paddle.position.y > this.position.y && paddle.position.x === this.position.x;
      if (this.facingDirection === UP) return paddle.position.y < this.position.y && paddle.position.x === this.position.x;
      return true;
    });

    const validCollisions = nearbyPaddles.map((paddle) => {
      return {
        paddle,
        overlap: calculateCollision(this.position, paddle.position),
        collisionTime: paddle.lastCollisionTime ?? -Infinity
      };
    }).filter(({ overlap }) => overlap > 0)
      .sort((src, target) => {
        return target.overlap !== src.overlap
          ? target.overlap - src.overlap
          : src.collisionTime - target.collisionTime;
      });

    this.paddle = validCollisions.length > 0 ? validCollisions[0].paddle : null;
  }

  turn(ramp: Ramp, kill: () => void) {
    if (!ramp.canTurn(this.facingDirection)) {
      kill();
    }

    const currentFacingVector = CardinalVectors[this.facingDirection];
    let targetFacingVactor = currentFacingVector.swap();
    targetFacingVactor = ramp.deflection === -1 ? targetFacingVactor.negate() : targetFacingVactor;

    Object.keys(CardinalVectors).forEach((key) => {
      const k = key as Direction;
      if (CardinalVectors[k].equals(targetFacingVactor)) {
        this.facingDirection = k;
      }
    })
  }

  redirect() {
    if (this.paddle && this.paddle.isActivated) {
      this.destinationPosition = this.paddle.position.duplicate();
      this.facingDirection = this.paddle.deflection;
      this.paddle.lastCollisionTime = performance.now();
      this.paddle = null;
    }
  }


  checkUpcomingObstacles(): 'move' | 'doom' {
    for (let i = 1; i <= 7; i++) {
      let checkPosition = this.destinationPosition.duplicate();
      if (this.facingDirection === UP) {
        checkPosition = checkPosition.add(new Vector2(0, -gridCells(i)));
      } else if (this.facingDirection === DOWN) {
        checkPosition = checkPosition.add(new Vector2(0, gridCells(i)));
      } else if (this.facingDirection === LEFT) {
        checkPosition = checkPosition.add(new Vector2(-gridCells(i), 0));
      } else if (this.facingDirection === RIGHT) {
        checkPosition = checkPosition.add(new Vector2(gridCells(i), 0));
      }

      // short circuit if any tile ahead is solid
      const destinationTile = this.parent?.children.filter((child) => {
        return child.position.equals(checkPosition);
      });
      const isObstruction = destinationTile?.some(tile => tile.isSolid);
      const isRamp = destinationTile?.some(tile => tile instanceof Ramp);
      if (isObstruction || isRamp) {
        return isObstruction ? 'doom' : 'move';
      }
    }
    return 'move';
  }

  debug(level: number) {
    const arrow = '-'.repeat(level + 1);

    console.debug(
      `${arrow}> ${this.constructor.name}, position: ${this.position} [${this.position.x / 16
      }, ${this.position.y / 16}] Parent: ${this.parent?.constructor.name}`
    );
    this.children.forEach((child) => {
      child.debug(level + 1);
    });
  }
}


