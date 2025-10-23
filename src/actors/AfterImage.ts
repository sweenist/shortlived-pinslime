import { GameObject } from "../gameEngine/GameObject";
import { Sprite } from "../gameEngine/Sprite";
import { resources } from "../Resources";
import type { Direction } from "../types";
import { Vector2 } from "../utils/vector";

export type Shade = {
  umbra: Sprite,
  penumbra: Sprite
};

export class AfterImage extends GameObject {
  umbra: Sprite | null;
  penumbra: Sprite | null;
  afterImageCollection: { [K in Direction]: Shade };

  constructor() {
    super();

    this.umbra = null;
    this.penumbra = null;

    this.afterImageCollection = this.buildAfterImages();
  }

  buildAfterImages(): { [K in Direction]: Shade } {

    const spriteParams = {
      resource: resources.images['slimeTrail'],
      frameSize: new Vector2(16, 16),
      frameColumns: 2,
      frameRows: 4,
    };

    return {
      'UP': {
        umbra: new Sprite(
          {
            ...spriteParams,
            frameIndex: 0,
            position: new Vector2(0, 5),
          }),
        penumbra: new Sprite(
          {
            ...spriteParams,
            frameIndex: 1,
            position: new Vector2(0, 14),
          })
      }, 'RIGHT': {
        umbra: new Sprite(
          {
            ...spriteParams,
            frameIndex: 2,
            position: new Vector2(-6, -1),
          }),
        penumbra: new Sprite(
          {
            ...spriteParams,
            frameIndex: 3,
            position: new Vector2(-15, -1),
          })
      }, 'DOWN': {
        umbra: new Sprite(
          {
            ...spriteParams,
            frameIndex: 4,
            position: new Vector2(0, -7),
          }),
        penumbra: new Sprite(
          {
            ...spriteParams,
            frameIndex: 5,
            position: new Vector2(0, -16),
          })
      }, 'LEFT': {
        umbra: new Sprite(
          {
            ...spriteParams,
            frameIndex: 6,
            position: new Vector2(6, -1),
          }),
        penumbra: new Sprite(
          {
            ...spriteParams,
            frameIndex: 7,
            position: new Vector2(15, -1),
          })
      }
    };
  }
}