import { Animations } from '../../gameEngine/Animations';
import { FrameIndexPattern } from '../../gameEngine/animations/FrameIndexPattern';
import { GameObject } from '../../gameEngine/GameObject';
import type { Main } from '../../gameEngine/Main';
import { Sprite } from '../../gameEngine/Sprite';
import { resources } from '../../Resources';
import type { LevelOptions } from '../../types';
import type { animationConfiguration } from '../../types/animationTypes';
import { gridCells } from '../../utils/grid';
import { Vector2 } from '../../utils/vector';
import { getCharacterFrame, getCharacterWidth } from './SpriteMapping';

type SpriteFontProps = {
  wordWidth: number;
  chars: {
    width: number;
    sprite: Sprite;
  }[];
};

const cursorAnimation: animationConfiguration = {
  duration: 250,
  type: 'frame',
  frames: [
    { frame: 0, time: 200 },
    { frame: 1, time: 250 }
  ]
}

export class OptionDialog extends GameObject {
  options: { [key: number]: string };
  optionWords: SpriteFontProps[][];
  cursor: Sprite;
  showingIndex: number = 0;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  activeOption: number = 1;
  drawWords: boolean = false;
  showCountdown: number;

  constructor(options: LevelOptions) {
    super();

    this.canvas = document.querySelector<HTMLCanvasElement>(options.canvasId)!;
    this.canvas.parentElement?.addEventListener('resize', this.resizeDialog)
    this.context = this.canvas.getContext('2d')!;
    this.context.imageSmoothingEnabled = false;
    this.options = options.options

    this.drawLayer = 'USER_INTERFACE';

    this.optionWords = this.getFontSprites();
    this.showCountdown = 2100;
    this.cursor = new Sprite({
      resource: resources.images['cursor'],
      frameColumns: 2,
      frameSize: new Vector2(8, 8),
      scale: 3,
      position: new Vector2(gridCells(1), gridCells(1) + 3),
      animations: new Animations({ default: new FrameIndexPattern(cursorAnimation) })
    });
  }

  step(deltaTime: number, _root?: Main): void {
    this.showCountdown -= deltaTime;
    this.drawWords = this.showCountdown < 0;
  }

  private resizeDialog() {
    this.canvas.width = Math.floor(this.canvas.parentElement?.offsetWidth ?? this.canvas.width);
    this.canvas.height = Math.floor(this.canvas.parentElement?.clientHeight ?? this.canvas.height);
    this.draw(this.context, this.position);
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
      this.cursor.animations?.play('default');
      // this.cursor.draw(ctx, Vector2.Zero());
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
