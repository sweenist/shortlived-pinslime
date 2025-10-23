import { STATE_NAMES } from "../constants";
import { signals } from "../events/eventConstants";
import { gameEvents } from "../events/Events";
import { GameObject } from "../gameEngine/GameObject";
import type { Main } from "../gameEngine/Main";
import { Sprite } from "../gameEngine/Sprite";
import { resources } from "../Resources";
import type { Movement, Direction } from "../types";
import { Vector2 } from "../utils/vector";

export type Shade = {
  umbra: Sprite,
  penumbra: Sprite
};

export type ShadowConfig = {
  [K in Direction]: {
    umbra: { frameIndex: number; position: { x: number; y: number } };
    penumbra: { frameIndex: number; position: { x: number; y: number } };
  };
};

export class AfterImage extends GameObject {
  umbra: Sprite | null = null;
  penumbra: Sprite | null = null;
  afterImageCollection: { [K in Direction]: Shade } = {} as { [K in Direction]: Shade };
  currentFacing?: Direction
  showPenumbra: boolean = false;
  timeToRenderUmbra: number = 0;
  timeToRenderPenumbra: number = 0;
  isActive: boolean = false;

  constructor(shadowConfig: ShadowConfig) {
    super();

    this.afterImageCollection = this.buildAfterImages(shadowConfig);
  }

  ready() {
    gameEvents.on<typeof STATE_NAMES[number]>(signals.stateChanged, this, (value) => {
      if (value === 'playing')
        this.isActive = true;
      else
        this.isActive = false;
    });

    gameEvents.on<Movement>(signals.slimePosition, this, ({ direction: facing }) => {
      if (!this.isActive) return;

      if (this.currentFacing !== facing) {
        this.timeToRenderUmbra = 67;
        this.tryRemoveChild(this.penumbra);
        this.tryRemoveChild(this.umbra);
        this.currentFacing = facing;
      }
    });
  }

  step(deltaTime: number, _root?: Main): void {
    if (this.timeToRenderUmbra > 0) {
      this.timeToRenderUmbra -= deltaTime;
      if (this.timeToRenderUmbra <= 0) {
        this.timeToRenderPenumbra = 50;
        this.umbra = this.afterImageCollection[this.currentFacing!].umbra
        this.addChild(this.umbra)
      }
    }
    else if (this.timeToRenderPenumbra > 0) {
      this.timeToRenderPenumbra -= deltaTime;
      if (this.timeToRenderPenumbra <= 0) {
        this.penumbra = this.afterImageCollection[this.currentFacing!].penumbra;
        this.addChild(this.penumbra);
      }
    }
  }

  clearShadows() {
    this.tryRemoveChild(this.umbra);
    this.tryRemoveChild(this.penumbra);

    this.umbra = null;
    this.penumbra = null;
  }

  private buildAfterImages(shadowConfig: ShadowConfig): { [K in Direction]: Shade } {

    const spriteParams = {
      resource: resources.images['slimeTrail'],
      frameSize: new Vector2(16, 16),
      frameColumns: 2,
      frameRows: 4,
    };

    const result = {} as { [K in Direction]: Shade };

    (Object.keys(shadowConfig) as Direction[]).forEach((dir) => {
      const cfg = shadowConfig[dir];
      result[dir] = {
        umbra: new Sprite({
          ...spriteParams,
          frameIndex: cfg.umbra.frameIndex,
          position: Vector2.fromPoint(cfg.umbra.position),
        }),
        penumbra: new Sprite({
          ...spriteParams,
          frameIndex: cfg.penumbra.frameIndex,
          position: Vector2.fromPoint(cfg.penumbra.position),
        }),
      };
    });

    return result;
  }
}