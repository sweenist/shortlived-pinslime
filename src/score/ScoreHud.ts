import { backgroundColor } from "../constants";
import { GameObject } from "../gameEngine/GameObject";
import { Label } from "../objects/TextBox/Label";
import { Vector2 } from "../utils/vector";

export class ScoreHud extends GameObject {
  scoreLabel: Label;
  scoreValue?: Label;
  hiScoreLabel?: Label;
  hiScoreValue?: Label;
  timeLabel?: Label;
  timeValue?: Label;

  constructor() {
    super();

    this.drawLayer = 'DEFAULT';

    this.scoreLabel = new Label({
      text: 'SCORE',
      position: new Vector2(8, 8),
    });

    this.addChild(this.scoreLabel);
  }

  draw(ctx: CanvasRenderingContext2D, position: Vector2, _debug?: boolean): void {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, ctx.canvas.width, 16);

    super.draw(ctx, position);
  }
}