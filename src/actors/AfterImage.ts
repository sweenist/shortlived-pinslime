import { GameObject } from "../gameEngine/GameObject";
import { Sprite } from "../gameEngine/Sprite";
import { resources } from "../Resources";
import type { Direction } from "../types";
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

  constructor(shadowConfig: ShadowConfig) {
    super();

    this.afterImageCollection = this.buildAfterImages(shadowConfig);
  }

  buildAfterImages(shadowConfig: ShadowConfig): { [K in Direction]: Shade } {

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