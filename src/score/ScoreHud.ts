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
  shouldDraw: boolean;
  canvasContext: CanvasRenderingContext2D;
  shouldDebug: boolean = true;

  constructor() {
    super();

    //gross but whatever
    const canvas = document.querySelector<HTMLCanvasElement>('#score-canvas');
    this.canvasContext = canvas?.getContext('2d')!;

    this.shouldDraw = false;

    this.scoreLabel = new Label({
      text: 'SCORE',
      position: new Vector2(8, 4),
      drawLayer: 'DEFAULT',
    });

    this.scoreValue = new Label({
      text: '00000',
      position: new Vector2(58, 4),
      drawLayer: 'DEFAULT',
      name: 'score-value'
    });

    this.hiScoreLabel = new Label({
      text: 'HISCORE',
      position: new Vector2(116, 4),
      drawLayer: 'DEFAULT'
    });

    this.hiScoreValue = new Label({
      text: '00000',
      position: new Vector2(184, 4),
      drawLayer: 'DEFAULT',
      name: 'hi-score-value'
    });

    this.timeLabel = new Label({
      text: 'TIME',
      position: new Vector2(240, 4),
      drawLayer: 'DEFAULT'
    });

    this.timeValue = new Label({
      text: '00',
      position: new Vector2(280, 4),
      drawLayer: 'DEFAULT',
      name: 'time-value',
    });


    this.addChild(this.scoreLabel);
    this.addChild(this.scoreValue);
    this.addChild(this.hiScoreLabel);
    this.addChild(this.hiScoreValue);
    this.addChild(this.timeLabel);
    this.addChild(this.timeValue);
  }

  draw(_ctx: CanvasRenderingContext2D, _position: Vector2, _debug?: boolean): void {
    super.draw(this.canvasContext, this.position, this.shouldDebug);
    this.shouldDebug = false
  }
}