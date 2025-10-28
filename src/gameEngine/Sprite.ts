import { Animations } from './Animations';
import { GameObject } from './GameObject';
import type { ImageResource } from '../Resources';
import { Vector2 } from '../utils/vector';

export interface SpriteParams {
  resource: ImageResource;
  name?: string;
  frameSize?: Vector2;
  frameColumns?: number;
  frameRows?: number;
  frameIndex?: number;
  scale?: number;
  position?: Vector2;
  animations?: Animations;
}

export class Sprite extends GameObject {
  resource: ImageResource;
  frameSize: Vector2;
  frameColumns: number;
  frameRows: number;
  frameIndex: number;
  frameMap: Map<number, Vector2> = new Map();
  scale: number;
  animations?: Animations | null;
  isVisible: boolean = true;

  constructor(params: SpriteParams) {
    super(params.position); // relative offset
    this.resource = params.resource;
    this.name = params.name ?? this.resource.name;
    this.frameSize = params.frameSize ?? new Vector2(16, 16);
    this.frameColumns = params.frameColumns ?? 1;
    this.frameRows = params.frameRows ?? 1;
    this.frameIndex = params.frameIndex ?? 0;
    this.scale = params.scale ?? 1;
    this.animations = params.animations;

    this.buildFrameMap();
  }

  buildFrameMap() {
    let index = 0;

    for (let row = 0; row < this.frameRows; row++) {
      for (let col = 0; col < this.frameColumns; col++) {
        this.frameMap.set(
          index,
          new Vector2(col * this.frameSize.x, row * this.frameSize.y)
        );
        index++;
      }
    }
  }

  step(deltaTime: number) {
    if (!this.animations) return;

    this.animations?.step(deltaTime);
    this.frameIndex = this.animations?.frame;
    if (this.animations?.offset) {
      console.info(`Shifting ${this.name} by ${this.animations.offset}`)
      this.position = this.position.add(this.animations?.offset);
    }
  }

  draw(
    ctx: CanvasRenderingContext2D,
    position: Vector2,
    debug: boolean = false
  ) {
    if (!this.resource.loaded) {
      if (debug) console.debug(`${this.resource.name} is not loaded`);
      return;
    }
    let frameCoordX = 0;
    let frameCoordY = 0;

    const frame = this.frameMap.get(this.frameIndex);
    if (frame) {
      frameCoordX = frame.x;
      frameCoordY = frame.y;
    }

    const frameSizeX = this.frameSize.x;
    const frameSizeY = this.frameSize.y;
    const drawPosition = position.add(this.position);

    if (debug)
      console.debug(
        `Sprite: ${this.name} -> size: ${frameSizeX}, ${frameSizeY}; pos: ${frameCoordX}, ${frameCoordY}`
      );

    if (this.isVisible)
      ctx.drawImage(
        this.resource.image,
        frameCoordX,
        frameCoordY,
        frameSizeX,
        frameSizeY,
        drawPosition.x,
        drawPosition.y,
        frameSizeX * this.scale,
        frameSizeY * this.scale
      );
  }
}
