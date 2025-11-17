import { STATE_NAMES, STATE_PLAYING } from "../constants";
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

const SHADOW_CONFIG =
  {
    UP: {
      umbra: { frameIndex: 0, position: { x: 0, y: 5 } },
      penumbra: { frameIndex: 1, position: { x: 0, y: 14 } }
    },
    RIGHT: {
      umbra: { frameIndex: 2, position: { x: -6, y: -1 } },
      penumbra: { frameIndex: 3, position: { x: -15, y: -1 } }
    },
    DOWN: {
      umbra: { frameIndex: 4, position: { x: 0, y: -7 } },
      penumbra: { frameIndex: 5, position: { x: 0, y: -16 } }
    },
    LEFT: {
      umbra: { frameIndex: 6, position: { x: 6, y: -1 } },
      penumbra: { frameIndex: 7, position: { x: 15, y: -1 } }
    }
  } as const;

export class AfterImage extends GameObject {
  umbra: Sprite | null = null;
  penumbra: Sprite | null = null;
  afterImageCollection: { [K in Direction]: Shade } = {} as { [K in Direction]: Shade };
  currentFacing?: Direction
  showPenumbra: boolean = false;
  timeToRenderUmbra: number = 0;
  timeToRenderPenumbra: number = 0;
  isActive: boolean = false;

  constructor() {
    super();

    this.afterImageCollection = this.buildAfterImages();
  }

  ready() {
    gameEvents.on<typeof STATE_NAMES[number]>(signals.stateChanged, this, (value) => {
      if (value === STATE_PLAYING)
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

  private buildAfterImages(): { [K in Direction]: Shade } {

    const spriteParams = {
      resource: resources.images['slimeTrail'],
      frameSize: new Vector2(16, 16),
      frameColumns: 2,
      frameRows: 4,
    };

    const result = {} as { [K in Direction]: Shade };

    (Object.keys(SHADOW_CONFIG) as Direction[]).forEach((dir) => {
      const cfg = SHADOW_CONFIG[dir];
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