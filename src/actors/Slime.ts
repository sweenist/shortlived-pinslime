import { Animations } from '../gameEngine/Animations';
import { FrameIndexPattern } from '../gameEngine/animations/FrameIndexPattern';
import { DOWN, LEFT, RIGHT, STATE_DEAD, STATE_EXPIRED, STATE_GAMEOVER, STATE_INITIAL, STATE_LAUNCHING, STATE_NAMES, UP } from '../constants';
import { GameObject } from '../gameEngine/GameObject';
import { resources } from '../Resources';
import { Sprite } from '../gameEngine/Sprite';
import { CardinalVectors, Vector2 } from '../utils/vector';
import {
  EXPIRED,
  IDLE_START,
  LAUNCH,
  MOVE_DOWN,
  MOVE_LEFT,
  MOVE_RIGHT,
  MOVE_UP,
} from './slimeAnimations';
import { moveTowards } from '../utils/moveUtils';
import { gameEvents } from '../events/Events';
import type { ItemEventMetaData } from '../types/eventTypes';
import type { Main } from '../gameEngine/Main';
import type { Direction, Movement } from '../types';
import { signals } from '../events/eventConstants';
import type { Ramp } from '../objects/Obstacles/Ramp';
import type { Paddle } from '../objects/Paddle/Paddle';
import { AfterImage } from './AfterImage';
import { ScoreText } from '../objects/TextBox/ScoreText';

const itemShiftStep = new Vector2(0, -1);

export class Slime extends GameObject {
  facingDirection: Direction;
  destinationPosition: Vector2;
  body: Sprite;
  paddle: Paddle | null | undefined;
  speed: number;
  afterImage: AfterImage;
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
      frameSize: new Vector2(16, 16),
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

    this.gizmo = new Sprite({
      resource: resources.images['gizmo'],
      frameSize: new Vector2(16, 16),
      position: Vector2.Zero()
    });

    this.afterImage = new AfterImage();

    this.addChild(this.body);
    this.addChild(this.afterImage);

    this.facingDirection = RIGHT;
    this.destinationPosition = this.position.duplicate();
  }

  ready(): void {
    gameEvents.on<ItemEventMetaData>(signals.slimeItemCollect, this, (value) =>
      this.onItemCollect(value)
    );

    gameEvents.on<typeof STATE_NAMES[number]>(signals.stateChanged, this, (value) => {
      console.warn(`State is now ${value}`);

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
        this.afterImage.clearShadows()
        this.itemPickupShell?.destroy();
        this.body.isVisible = false;
      }
      else if (value === STATE_GAMEOVER) {
        this.body.isVisible = false;
        this.isLocked = true;
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
      if (this.paddle.isActivated) {
        this.facingDirection = this.paddle.deflection;
        this.paddle = null;
      }
    }

    if (state.current === STATE_LAUNCHING) {
      const inertiaStep = LAUNCH.duration - LAUNCH.frames[4].time;
      const stateTime = state.getStepTime();
      if (stateTime < inertiaStep) {
        moveTowards(this.position, this.destinationPosition, this.speed)
      }
      return;
    }

    const distance = moveTowards(this.position, this.destinationPosition, this.speed);
    const hasArrived = distance < 1;

    if (hasArrived) {
      this.tryMove(root);
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
    const ramp = destinationTile?.find((tile) => tile.constructor.name === 'Ramp') as Ramp | undefined;
    const paddle = destinationTile?.find((tile) => tile.constructor.name === 'Paddle') as Paddle | undefined;

    if (isObstruction) {
      state.kill();
      return;
    }
    if (ramp) {
      this.turn(ramp, () => state.kill());
    }
    if (paddle) {
      this.paddle = paddle;
    } else if (this.paddle) {
      this.paddle = null;
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
    const scoreSpriteText = new ScoreText({ position: new Vector2(20, -12), score: `${points}` });
    this.itemPickupShell.addChild(
      new Sprite({
        resource: image,
        frameSize: new Vector2(16, 16),
        position: new Vector2(0, -18),
        name: 'item'
      })
    );
    this.itemPickupShell.addChild(scoreSpriteText);

    this.itemPickupShell.name = 'shell';
    this.addChild(this.itemPickupShell);
  }

  turn(ramp: Ramp, kill: () => void) {
    if (!ramp.canTurn(this.facingDirection)) {
      console.info(`Did not find ${this.facingDirection} in`, ramp.approaches)
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
