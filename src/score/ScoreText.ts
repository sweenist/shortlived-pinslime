import { GameObject } from "../gameEngine/GameObject";
import { Sprite } from "../gameEngine/Sprite";
import { getCharacterFrame } from "../objects/TextBox/SpriteMapping";
import { resources } from "../Resources";
import { Vector2 } from "../utils/vector";

type NumericSprites = {
  [key: string]: Sprite;
};

type ScoreTextParams = {
  position: Vector2
  initialValue: number,
  leadingZeros?: number
}
const NUMBER_WIDTH = 8 as const;

export class ScoreText extends GameObject {
  scoreChars: NumericSprites;
  scoreValue: number;
  leadingZeros: number | null;

  constructor(params: ScoreTextParams) {
    super(params.position);

    this.scoreValue = params.initialValue;
    this.leadingZeros = params.leadingZeros ?? null

    this.scoreChars = this.getNumberSprites();
    console.warn(this.scoreChars);
  }

  private getNumberSprites(): NumericSprites {
    const returnObject: NumericSprites = {};
    for (let i = 0; i < 10; i++) {
      const char = i.toString();
      returnObject[char] = new Sprite({
        resource: resources.images['font'],
        name: char,
        frameColumns: 13,
        frameRows: 5,
        frameSize: new Vector2(8, 8),
        frameIndex: getCharacterFrame(char),
      });
    }
    return returnObject;
  };

  draw(ctx: CanvasRenderingContext2D, position: Vector2): void {
    const positionOffset = position.add(this.position);
    this.drawImage(ctx, positionOffset);
  }

  drawImage(ctx: CanvasRenderingContext2D, position: Vector2): void {
    let cursorX = position.x;
    const scoreText = String(this.scoreValue).padStart(this.leadingZeros!, '0');

    scoreText.split('').forEach((char) => {
      const sprite = this.scoreChars[char] ?? null;

      const drawPosition = new Vector2(cursorX, position.y);
      sprite?.draw(ctx, drawPosition);

      cursorX += NUMBER_WIDTH * (sprite?.scale ?? 1) + 1;
    });
  }
}
