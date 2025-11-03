import { GameObject } from "../gameEngine/GameObject";
import type { Main } from "../gameEngine/Main";
import { Sprite } from "../gameEngine/Sprite";
import { resources } from "../Resources";
import { Vector2 } from "../utils/vector";

export class Title extends GameObject {
  background: Sprite;

  constructor() {
    super()

    this.background = new Sprite({
      resource: resources.images['title'],
      frameSize: new Vector2(320, 180)
    });

    this.addChild(this.background)
  }

  step(_deltaTime: number, _root?: Main): void {
    // TODO: when space pressed, show level select/play
  }

  draw(ctx: CanvasRenderingContext2D, _position: Vector2, _debug?: boolean): void {
    const imageAscpectRatio = this.background.frameSize.x / this.background.frameSize.y;
    const canvasAspectRatio = ctx.canvas.width / ctx.canvas.height;

    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
    if (canvasAspectRatio > imageAscpectRatio) {
      drawHeight = ctx.canvas.height;
      drawWidth = drawHeight * imageAscpectRatio;
      offsetX = (ctx.canvas.width - drawWidth) / 2;
    } else {
      drawWidth = ctx.canvas.width;
      drawHeight = drawWidth / imageAscpectRatio;
      offsetY = (ctx.canvas.height - drawHeight) / 2;
    }
    ctx.drawImage(this.background.resource.image, offsetX, offsetY, ctx.canvas.width, ctx.canvas.height)
  }
}
