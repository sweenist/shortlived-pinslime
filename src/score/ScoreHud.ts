import { canvasManager } from "../gameEngine/CanvasManager";
import { GameObject } from "../gameEngine/GameObject";
import type { Main } from "../gameEngine/Main";
import { Label } from "../objects/TextBox/Label";
import { Vector2 } from "../utils/vector";
import { ScoreText } from "./ScoreText";
import type { ScoreViewModel } from "./ScoreViewModel";

export class ScoreHud extends GameObject {
  viewModel: ScoreViewModel;
  scoreLabel: Label;
  scoreValue: ScoreText;
  hiScoreLabel: Label;
  hiScoreValue: ScoreText;
  timeLabel: Label;
  timeValue: ScoreText;

  constructor(viewModel: ScoreViewModel) {
    super();

    this.viewModel = viewModel;

    this.scoreLabel = new Label({
      text: 'SCORE',
      position: new Vector2(8, 4),
      drawLayer: 'DEFAULT',
    });

    this.scoreValue = new ScoreText({
      initialValue: 0,
      position: new Vector2(58, 4),
      leadingZeros: 5
    });

    this.hiScoreLabel = new Label({
      text: 'HISCORE',
      position: new Vector2(116, 4),
      drawLayer: 'DEFAULT'
    });

    this.hiScoreValue = new ScoreText({
      position: new Vector2(184, 4),
      initialValue: this.viewModel.highScore,
      leadingZeros: 5,
    });

    this.timeLabel = new Label({
      text: 'TIME',
      position: new Vector2(240, 4),
      drawLayer: 'DEFAULT'
    });

    this.timeValue = new ScoreText({
      position: new Vector2(280, 4),
      initialValue: this.viewModel.timeRemaining / 1000,
      leadingZeros: 2
    });

    this.addChild(this.viewModel);
    this.addChild(this.scoreLabel);
    this.addChild(this.scoreValue);
    this.addChild(this.hiScoreLabel);
    this.addChild(this.hiScoreValue);
    this.addChild(this.timeLabel);
    this.addChild(this.timeValue);
  }

  step(_deltaTime: number, _root?: Main): void {
    this.scoreValue.scoreValue = this.viewModel.score; //direct manipulation feels gross;
    this.timeValue.scoreValue = Math.ceil(this.viewModel.timeRemaining / 1000);
  }

  draw(_ctx: CanvasRenderingContext2D, _position: Vector2, _debug?: boolean): void {
    super.draw(canvasManager.getContext('score'), this.position);
  }
}