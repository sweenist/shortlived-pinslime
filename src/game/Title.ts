import { STATE_INITIAL } from "../constants";
import { signals } from "../events/eventConstants";
import { gameEvents } from "../events/Events";
import { GameObject } from "../gameEngine/GameObject";
import { Sprite } from "../gameEngine/Sprite";
import { configurationManager } from "../levels/configurationManager";
import { Pinball } from "../levels/Pinball";
import { OptionDialog } from "../objects/TextBox/OptionDialog";
import { resources } from "../Resources";
import { gridCells } from "../utils/grid";
import { Vector2 } from "../utils/vector";
import { gameState } from "./GameState";

export class Title extends GameObject {
  background: Sprite;
  text: Sprite;
  optionMenu: OptionDialog;

  constructor() {
    super()

    this.background = new Sprite({
      resource: resources.images['title'],
      frameSize: new Vector2(320, 180)
    });

    this.text = new Sprite({
      resource: resources.images['titletext'],
      frameSize: new Vector2(384, 80),
      scale: 0.5,
    });

    this.optionMenu = new OptionDialog({
      canvasId: '#options-canvas',
      options: {
        0: {
          text: 'Play',
          action: () => {
            gameState.set(STATE_INITIAL);
            gameEvents.emit(signals.levelChanging, new Pinball({ actorPosition: new Vector2(gridCells(0), gridCells(8)), levelConfig: configurationManager[0] }))
          }
        }
      }
    });

    this.addChild(this.background);
    this.addChild(this.text);
    this.addChild(this.optionMenu);
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

    const textX = Math.abs((ctx.canvas.width / 2) - (this.text.resource.image.width / 4)); // scale is 1/2
    this.text.draw(ctx, new Vector2(textX, 0));
  }
}
