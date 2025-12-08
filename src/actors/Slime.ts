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
  LAUNCH,
  MOVE_DOWN,
  MOVE_LEFT,
  MOVE_RIGHT,
  MOVE_UP,
} from './slimeAnimations';
import { moveTowards, updateMidPoint } from '../utils/moveUtils';
import { gameEvents } from '../events/Events';
import type { ItemEventMetaData } from '../types/eventTypes';
import type { Main } from '../gameEngine/Main';
import type { Direction, GameStateType, Movement } from '../types';
import { signals } from '../events/eventConstants';
import { Ramp } from '../objects/Obstacles/Ramp';
import { Paddle } from '../objects/Paddle/Paddle';
import { AfterImage } from './AfterImage';
import { ScoreToast } from '../objects/TextBox/ScoreToast';
import type { Pinball } from '../levels/Pinball';

const itemShiftStep = new Vector2(0, -1);

export class Slime extends GameObject {
  facingDirection: Direction;
  midPoint: Vector2;
  destinationPosition: Vector2;
  body: Sprite;
  paddle: Paddle | null | undefined;
  speed: number;
  afterImage: AfterImage;
  deathThroes: Sprite;
  itemPickupTime: number = 0;
  itemPickupShell?: GameObject;
  isLocked: boolean = false;
  isTurning: boolean = false;
  gizmo: Sprite;
  isLevelBuilding: boolean = false;

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
      }),
    });

    this.midPoint = this.position.add(new Vector2(8, 8));

    this.gizmo = new Sprite({
      resource: resources.images['gizmo'],
      frameSize: spriteSize,
      position: Vector2.Zero()
    });

    this.afterImage = new AfterImage();

    this.addChild(this.body);
    this.addChild(this.afterImage);

    this.deathThroes = new Sprite({
      resource: resources.images['slimeDeath'],
      frameSize: new Vector2(128, 128),
      frameColumns: 8,
      frameRows: 7,
      position: new Vector2(-64, -112),
      animations: new Animations(
        { death: new FrameIndexPattern(DEATH), }
      )
    });

    this.facingDirection = RIGHT;
    this.destinationPosition = this.position.duplicate();
  }

  ready(): void {
    gameEvents.on<ItemEventMetaData>(signals.slimeItemCollect, this, (value) =>
      this.onItemCollect(value)
    );

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
        this.itemPickupShell?.destroy();
        this.body.animations?.playOnce('expired', () => {
          this.body.isVisible = false;
        });
      }
      else if (value === STATE_DEAD) {
        this.afterImage.clearShadows();
        this.itemPickupShell?.destroy();
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

  step(deltaTime: number, root: Main) {
    if (this.itemPickupTime > 0) {
      this.processOnItemPickup(deltaTime);
    }

    const { input, state } = root;
    if (input.getActionJustPressed('Space') && this.paddle) {
      this.redirect()
    }

    if (state.current === STATE_LAUNCHING) {
      const inertiaStep = LAUNCH.duration - LAUNCH.frames[4].time;
      const stateTime = state.getStepTime();
      if (stateTime < inertiaStep) {
        moveTowards(this.position, this.destinationPosition, this.speed)
      }
      return;
    }

    if (state.isPlaying) {
      const distance = moveTowards(this.position, this.destinationPosition, this.speed);
      updateMidPoint(this.position, this.midPoint);
      this.checkForPaddle();

      const hasArrived = distance < 1;

      if (hasArrived) {
        this.tryMove(root);
      }
    }

    if (state.current !== STATE_GAMEOVER)
      gameEvents.emit(signals.slimePosition, { position: this.position, direction: this.facingDirection } as Movement);
  }

  tryMove(root: Main) {
    if (this.isLocked || root.isFading) return;

    const { state } = root!;
    if (!state.isPlaying) {
      return;
    }

    let nextX = this.destinationPosition.x;
    let nextY = this.destinationPosition.y;

    const gridSize = 16;

    if (this.facingDirection === UP) {
      nextY -= gridSize;
      this.body.animations?.play('moveUp');
    }

    if (this.facingDirection === DOWN) {
      nextY += gridSize;
      this.body.animations?.play('moveDown');
    }

    if (this.facingDirection === LEFT) {
      nextX -= gridSize;
      this.body.animations?.play('moveLeft');
    }

    if (this.facingDirection === RIGHT) {
      nextX += gridSize;
      this.body.animations?.play('moveRight');
    }

    const destination = new Vector2(nextX, nextY);

    const destinationTile = this.parent?.children.filter((child) => {
      return child.position.equals(destination);
    });
    const isObstruction = destinationTile?.some(tile => tile.isSolid);
    const ramp = destinationTile?.find((tile): tile is Ramp => tile instanceof Ramp) as Ramp | undefined;

    if (isObstruction) {
      state.kill();
      return;
    }
    if (ramp) {
      this.turn(ramp, () => state.kill());
    }

    this.destinationPosition = destination;
  }

  processOnItemPickup(delta: number) {
    this.itemPickupTime -= delta;
    const itemSprites = this.itemPickupShell?.children.filter((child) => child.name === 'item');
    itemSprites?.forEach((item) => {
      item.position = item.position.add(itemShiftStep);
    });

    if (this.itemPickupTime <= 0) {
      this.itemPickupShell?.destroy();
    }
  }

  onItemCollect(value: ItemEventMetaData) {
    const { image, points } = value;

    gameEvents.emit(signals.scoreUpdate, points);
    this.itemPickupTime = 750;

    this.itemPickupShell = new GameObject();
    const scoreSpriteText = new ScoreToast({ position: new Vector2(20, -12), score: `${points}` });
    this.itemPickupShell.addChild(
      new Sprite({
        resource: image,
        frameSize: spriteSize,
        position: new Vector2(0, -18),
        name: 'item'
      })
    );
    this.itemPickupShell.addChild(scoreSpriteText);

    this.itemPickupShell.name = 'shell';
    this.addChild(this.itemPickupShell);
  }

  checkForPaddle() {
    const isHorizontal = [LEFT, RIGHT].includes(this.facingDirection);

    // only check if midpoint coordinate is multiple of 16
    if (isHorizontal && this.midPoint.x % 16 !== 0)
      return;
    if (!isHorizontal && this.midPoint.y % 16 !== 0)
      return;

    const usePaddleExtrema = [UP, LEFT].includes(this.facingDirection);

    let checkPosition: Vector2 = this.midPoint.duplicate();

    switch (this.facingDirection) {
      case 'UP':
        {
          checkPosition.x = this.position.x + 16;
          break;
        }
      case 'DOWN': {
        checkPosition.x = this.position.x;
        break;
      }
      case 'LEFT': {
        checkPosition.y = this.position.y + 16;
        break;
      }
      case 'RIGHT': {
        checkPosition.y = this.position.y;
      }
    }

    const candidate = (this.parent as Pinball).paddles.find((paddle) => {
      return usePaddleExtrema
        ? paddle.bottomRight.equals(checkPosition)
        : paddle.position.equals(checkPosition);
    }) ?? null;

    this.paddle = candidate;
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
      this.paddle = null;
    }
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
