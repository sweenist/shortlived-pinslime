import { STATE_INITIAL } from "../constants";
import { signals } from "../events/eventConstants";
import { gameEvents } from "../events/Events";
import { GameObject } from "../gameEngine/GameObject";
import type { Main } from "../gameEngine/Main";
import { Sprite } from "../gameEngine/Sprite";
import { Pinball } from "../levels/Pinball";
import { OptionDialog } from "../objects/TextBox/OptionDialog";
import { resources } from "../Resources";
import { gridCells } from "../utils/grid";
import { Vector2 } from "../utils/vector";

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
      scale: 0.5
    });
    this.text.drawLayer = "USER_INTERFACE";

    this.optionMenu = new OptionDialog({ canvasId: '#options-canvas', options: { 1: 'Play' } })

    this.addChild(this.background);
    this.addChild(this.text);
    this.addChild(this.optionMenu);
  }

  step(_deltaTime: number, root?: Main): void {
    const { input, state } = root!;

    if (input.getActionJustPressed('Space')) {
      state.set(STATE_INITIAL);
      gameEvents.unsubscribe(this)
      this.hideOptions();
      // use activeOption form this.options
      gameEvents.emit(signals.levelChanging, new Pinball({ actorPosition: new Vector2(gridCells(0), gridCells(8)) }));

    }
  }

  hideOptions() {
    const optionDiv = document.getElementById('options');
    optionDiv?.classList.add('hidden');
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
    this.optionMenu.draw(this.optionMenu.context, new Vector2(gridCells(3), 0));
  }
}
