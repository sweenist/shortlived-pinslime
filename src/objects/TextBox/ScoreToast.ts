import { GameObject } from '../../gameEngine/GameObject';
import { Sprite } from '../../gameEngine/Sprite';
import { resources } from '../../Resources';
import { fontSize, Vector2 } from '../../utils/vector';
import { getCharacterFrame, getCharacterWidth } from './SpriteMapping';

type CharacterSprites = {
  width: number;
  sprite: Sprite;
};

const MAX_OPACITY = 1.0;

export class ScoreToast extends GameObject {
  drawWords: boolean = false;
  scoreChars: CharacterSprites[];
  alpha: number = 1.0;

  constructor(params: { position: Vector2, score: string }) {
    super(params.position);

    this.scoreChars = this.getNumberSprites(params.score)
  }

  private getNumberSprites(score: string): CharacterSprites[] {
    return score.split('').map((char) => {
      const charWidth = getCharacterWidth(char);

      return {
        width: charWidth,
        sprite: new Sprite({
          resource: resources.images['font'],
          name: char,
          frameColumns: 13,
          frameRows: 5,
          frameSize: fontSize,
          frameIndex: getCharacterFrame(char),
        }),
      };
    });
  };

  draw(ctx: CanvasRenderingContext2D, position: Vector2): void {
    const positionOffset = position.add(this.position);
    this.drawImage(ctx, positionOffset);
  }

  drawImage(ctx: CanvasRenderingContext2D, position: Vector2): void {

    let cursorX = position.x;
    let currentShowIndex = 0;

    this.scoreChars.forEach((char) => {
      const { width, sprite } = char;
      const widthCharOffset = cursorX - 5;

      const drawPosition = new Vector2(widthCharOffset, position.y);

      ctx.globalAlpha = this.alpha;
      sprite.draw(ctx, drawPosition);
      ctx.globalAlpha = MAX_OPACITY;

      cursorX += width * sprite.scale + 1;
      currentShowIndex += 1;
    });
  }
}
