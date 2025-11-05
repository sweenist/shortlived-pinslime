import { GameObject } from '../../gameEngine/GameObject';
import type { Main } from '../../gameEngine/Main';
import { Sprite } from '../../gameEngine/Sprite';
import { resources } from '../../Resources';
import type { LevelOptions } from '../../types';
import { Vector2 } from '../../utils/vector';
import { getCharacterFrame, getCharacterWidth } from './SpriteMapping';

type SpriteFontProps = {
  wordWidth: number;
  chars: {
    width: number;
    sprite: Sprite;
  }[];
};

export class OptionDialog extends GameObject {
  options: { [key: number]: string };
  optionWords: SpriteFontProps[][];
  showingIndex: number = 0;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  activeOption: number = 1;
  drawWords: boolean = false;
  showCountdown: number;

  constructor(options: LevelOptions) {
    super();

    this.canvas = document.querySelector<HTMLCanvasElement>(options.canvasId)!;
    this.context = this.canvas.getContext('2d')!;
    this.context.imageSmoothingEnabled = false;
    this.options = options.options

    this.drawLayer = 'USER_INTERFACE';

    this.optionWords = this.getFontSprites();
    this.showCountdown = 2100;
  }

  step(deltaTime: number, _root?: Main): void {
    this.showCountdown -= deltaTime;
    this.drawWords = this.showCountdown < 0;
  }

  private getFontSprites(): SpriteFontProps[][] {
    const message = Object.values(this.options)
    return message.map((m) => m.split(' ').map((word) => {
      let wordWidth = 0;
      const chars = word.split('').map((char) => {
        const charWidth = getCharacterWidth(char);
        wordWidth += charWidth;

        return {
          width: charWidth,
          sprite: new Sprite({
            resource: resources.images.fontWhite,
            name: char,
            frameColumns: 13,
            frameRows: 5,
            frameSize: new Vector2(8, 8),
            frameIndex: getCharacterFrame(char),
            scale: 3
          }),
        };
      });
      return {
        wordWidth,
        chars,
      };
    }));
  }

  draw(ctx: CanvasRenderingContext2D, position: Vector2): void {
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.drawWords) {
      const positionOffset = position.add(this.position);
      this.drawImage(ctx, positionOffset);
    }
  }

  drawImage(_ctx: CanvasRenderingContext2D, position: Vector2): void {
    const PADDING_LEFT = 7;
    const PADDING_TOP = 7;
    const LINE_MAX_WIDTH = 240;
    const LINE_VERTICAL_HEIGHT = 14;

    let cursorX = position.x + PADDING_LEFT;
    let cursorY = position.y + PADDING_TOP;
    let currentShowIndex = 0;

    for (let index = 0; index < this.optionWords.length; index++) {
      cursorY += LINE_VERTICAL_HEIGHT;

      this.optionWords[index].forEach((word) => {
        const spaceRemaining = position.x + LINE_MAX_WIDTH - cursorX;
        if (spaceRemaining < word.wordWidth) {
          cursorY += LINE_VERTICAL_HEIGHT;
          cursorX = position.x + PADDING_LEFT;
        }
        word.chars.forEach((char) => {
          const { width, sprite } = char;
          const widthCharOffset = cursorX - 5;

          const drawPosition = new Vector2(widthCharOffset, cursorY);
          sprite.draw(this.context, drawPosition);

          cursorX += width * sprite.scale + 1;
          currentShowIndex += 1;
        });

        cursorX += 3;
      });
    }
  }
}
