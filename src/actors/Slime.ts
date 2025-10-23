import { Animations } from '../gameEngine/Animations';
import { FrameIndexPattern } from '../gameEngine/FrameIndexPattern';
import { DOWN, LEFT, RIGHT, STATE_DEAD, STATE_EXPIRED, STATE_GAMEOVER, STATE_INITIAL, STATE_LAUNCHING, UP } from '../constants';
import { GameObject } from '../gameEngine/GameObject';
import { resources } from '../Resources';
import { Sprite } from '../gameEngine/Sprite';
import { CardinalVectors, Vector2 } from '../utils/vector';
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
import { moveTowards } from '../utils/moveUtils';
import { gameEvents } from '../events/Events';
import type { ItemEventMetaData } from '../types/eventTypes';
import type { Main } from '../gameEngine/Main';
import type { deflectionCoefficient, Direction, Movement } from '../types';
import { signals } from '../events/eventConstants';
import type { Ramp } from '../objects/Obstacles/Ramp';
import type { Paddle } from '../objects/Paddle/Paddle';
import { AfterImage, type ShadowConfig } from './AfterImage';

export class Slime extends GameObject {
  facingDirection: Direction;
  destinationPosition: Vector2;
  body: Sprite;
  deathThroes: Sprite;
  paddle: Paddle | null | undefined;
  speed: number;
  afterImage: AfterImage;
  itemPickupTime: number = 0;
  itemPickupShell?: GameObject;
  isLocked: boolean = false;
  isTurning: boolean = false;

  debugExpired: number = 0;

  constructor(position: Vector2, speed: number = 4, shadowConfig: ShadowConfig) {
    super(position);

    this.speed = speed;

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

    this.afterImage = new AfterImage(shadowConfig);

    this.addChild(this.body);
    this.addChild(this.afterImage);

    this.facingDirection = RIGHT;
    this.destinationPosition = this.position.duplicate();
  }

  ready(): void {
    gameEvents.on<ItemEventMetaData>(signals.slimeItemCollect, this, (value) =>
      this.onItemCollect(value)
    );

    gameEvents.on<string>(signals.stateChanged, this, (value) => {
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
        this.afterImage.clearShadows()
        this.body.isVisible = false;
        this.addChild(this.deathThroes);
        this.deathThroes.animations?.play('death');
      }
      else if (value === STATE_GAMEOVER) {
        this.removeChild(this.deathThroes);
        this.body.isVisible = false;
        this.isLocked = true;
        gameEvents.unsubscribe(this)
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

    gameEvents.emit(signals.slimePosition, { position: this.position, direction: this.facingDirection } as Movement);
  }

  tryMove(root: Main) {
    if (this.isLocked || root.isFading) return;

    const { state } = root;
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
      this.turn(ramp.deflection);
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
    this.body.animations?.play('pickUpDown');

    if (this.itemPickupTime <= 0) {
      this.itemPickupShell?.destroy();
    }
  }

  onItemCollect(value: ItemEventMetaData) {
    const { position, image } = value;
    this.position = position.duplicate();

    this.itemPickupTime = 50;

    this.itemPickupShell = new GameObject();
    this.itemPickupShell.addChild(
      new Sprite({
        resource: image,
        position: new Vector2(0, -18),
      })
    );
    this.addChild(this.itemPickupShell);
  }

  turn(deflection: deflectionCoefficient) {
    const currentFacingVector = CardinalVectors[this.facingDirection];
    let targetFacingVactor = currentFacingVector.swap();
    targetFacingVactor = deflection === -1 ? targetFacingVactor.negate() : targetFacingVactor;

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
