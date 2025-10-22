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
import type { deflectionCoefficient, Direction } from '../types';
import { signals } from '../events/eventConstants';
import type { Ramp } from '../objects/Obstacles/Ramp';
import type { Paddle } from '../objects/Paddle/Paddle';

type Shadows = {
  umbra?: Sprite | null,
  penumbra?: Sprite | null
};

export class Slime extends GameObject {
  facingDirection: Direction;
  destinationPosition: Vector2;
  body: Sprite;
  deathThroes: Sprite;
  paddle: Paddle | null | undefined;
  speed: number;
  shadows: Shadows = {};
  trails: { [key: string]: Sprite };
  itemPickupTime: number = 0;
  itemPickupShell?: GameObject;
  isLocked: boolean = false;
  isTurning: boolean = false;

  debugExpired: number = 0;

  constructor(position: Vector2, speed: number = 4) {
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

    this.addChild(this.body);

    this.trails = this.buildShadows()

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
        this.body.animations?.playOnce('launch', () => {
          this.body.animations?.play('moveRight');
        });
      }
      else if (value === STATE_EXPIRED) {
        this.clearShadows();
        this.body.animations?.playOnce('expired', () => {
          this.body.isVisible = false;
        });
      }
      else if (value === STATE_DEAD) {
        this.clearShadows()
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

    const { input } = root;
    if (input.getActionJustPressed('Space') && this.paddle) {
      if (this.paddle.isActivated) {
        this.facingDirection = this.paddle.deflection;
        this.paddle = null;
      }
    }

    const distance = moveTowards(this.position, this.destinationPosition, this.speed);
    const hasArrived = distance < 1;

    if (hasArrived) {
      this.tryMove(root);
    }

    gameEvents.emit(signals.slimePosition, this.position);
  }

  tryMove(root: Main) {
    if (this.isLocked || root.isFading) return;

    const { state } = root;
    if (!state.isPlaying) {
      return;
    }

    const { input } = root;

    if (!input.direction) {
      if (this.shadows.penumbra) {
        this.removeChild(this.shadows.penumbra);
        this.shadows.penumbra = null;
      }
      else if (this.shadows.umbra) {
        this.removeChild(this.shadows.umbra);
        this.shadows.umbra = null;
      }
    }

    let nextX = this.destinationPosition.x;
    let nextY = this.destinationPosition.y;

    const gridSize = 16;

    if (this.facingDirection === UP) {
      nextY -= gridSize;
      if (!this.shadows.umbra) {
        this.shadows.umbra = this.trails.UpUmbra
        this.addChild(this.shadows.umbra);
      } else if (!this.shadows.penumbra) {
        this.shadows.penumbra = this.trails.UpPenumbra
        this.addChild(this.shadows.penumbra);
      }

      this.body.animations?.play('moveUp');
    }
    if (this.facingDirection === DOWN) {
      nextY += gridSize;
      if (!this.shadows.umbra) {
        this.shadows.umbra = this.trails.DownUmbra
        this.addChild(this.shadows.umbra);
      } else if (!this.shadows.penumbra) {
        this.shadows.penumbra = this.trails.DownPenumbra
        this.addChild(this.shadows.penumbra);
      }

      this.body.animations?.play('moveDown');
    }
    if (this.facingDirection === LEFT) {
      nextX -= gridSize;
      if (!this.shadows.umbra) {
        this.shadows.umbra = this.trails.LeftUmbra
        this.addChild(this.shadows.umbra);
      } else if (!this.shadows.penumbra) {
        this.shadows.penumbra = this.trails.LeftPenumbra
        this.addChild(this.shadows.penumbra);
      }

      this.body.animations?.play('moveLeft');
    }
    if (this.facingDirection === RIGHT) {
      nextX += gridSize;
      if (!this.shadows.umbra) {
        this.shadows.umbra = this.trails.RightUmbra
        this.addChild(this.shadows.umbra);
      } else if (!this.shadows.penumbra) {
        this.shadows.penumbra = this.trails.RightPenumbra
        this.addChild(this.shadows.penumbra);
      }

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

    this.itemPickupTime = 1250;

    this.itemPickupShell = new GameObject();
    this.itemPickupShell.addChild(
      new Sprite({
        resource: image,
        position: new Vector2(0, -18),
      })
    );
    this.addChild(this.itemPickupShell);
  }

  buildShadows() {
    const spriteParams = {
      resource: resources.images['slimeTrail'],
      frameSize: new Vector2(16, 16),
      frameColumns: 2,
      frameRows: 4,
    };
    return {
      UpUmbra: new Sprite(
        {
          ...spriteParams,
          frameIndex: 0,
          position: new Vector2(0, 5),
        }),
      UpPenumbra: new Sprite(
        {
          ...spriteParams,
          frameIndex: 1,
          position: new Vector2(0, 14),
        }),
      RightUmbra: new Sprite(
        {
          ...spriteParams,
          frameIndex: 2,
          position: new Vector2(-6, -1),
        }),
      RightPenumbra: new Sprite(
        {
          ...spriteParams,
          frameIndex: 3,
          position: new Vector2(-15, -1),
        }),
      DownUmbra: new Sprite(
        {
          ...spriteParams,
          frameIndex: 4,
          position: new Vector2(0, -7),
        }),
      DownPenumbra: new Sprite(
        {
          ...spriteParams,
          frameIndex: 5,
          position: new Vector2(0, -16),
        }),
      LeftUmbra: new Sprite(
        {
          ...spriteParams,
          frameIndex: 6,
          position: new Vector2(6, -1),
        }),
      LeftPenumbra: new Sprite(
        {
          ...spriteParams,
          frameIndex: 7,
          position: new Vector2(15, -1),
        }),

    };
  }

  clearShadows() {
    if (this.shadows.penumbra) {
      this.removeChild(this.shadows.penumbra);
      this.shadows.penumbra = null;
    }
    if (this.shadows.umbra) {
      this.removeChild(this.shadows.umbra);
      this.shadows.umbra = null;
    }
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
