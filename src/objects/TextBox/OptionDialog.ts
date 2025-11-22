import { DOWN, UP } from '../../constants';
import { signals } from '../../events/eventConstants';
import { gameEvents } from '../../events/Events';
import { Animations } from '../../gameEngine/Animations';
import { FrameIndexPattern } from '../../gameEngine/animations/FrameIndexPattern';
import { GameObject } from '../../gameEngine/GameObject';
import type { Main } from '../../gameEngine/Main';
import { Sprite } from '../../gameEngine/Sprite';
import { resources } from '../../Resources';
import type { OptionMenuParams, OptionActions, Direction } from '../../types';
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
  duration: 1000,
  type: 'frame',
  frames: [
    { frame: 0, time: 0 },
    { frame: 1, time: 625 }
  ]
}

export class OptionDialog extends GameObject {
  options: OptionActions[];
  optionWords: SpriteFontProps[][];
  selectionArrow: Sprite;
  canvas: HTMLCanvasElement;
  activeOption: number = 0;
  displayWords: boolean = false;
  showCountdown: number;

  constructor(options: OptionMenuParams) {
    super();


    this.canvas = document.querySelector<HTMLCanvasElement>(options.canvasId)!;
    this.canvas.parentElement?.addEventListener('resize', this.resizeDialog)
    this.canvas.parentElement?.classList.remove('complete');

    this.options = options.options
    this.drawLayer = 'USER_INTERFACE';

    this.optionWords = this.getFontSprites();

    this.showCountdown = 2100;
    this.selectionArrow = new Sprite({
      resource: resources.images['cursor'],
      frameColumns: 2,
      frameSize: new Vector2(8, 8),
      scale: 3,
      position: new Vector2(gridCells(1), gridCells(1) + 3),
      animations: new Animations({ default: new FrameIndexPattern(cursorAnimation) }),
      drawLayer: 'USER_INTERFACE',
    });
    this.show();
  }

  ready(): void {
    gameEvents.on<Direction>(signals.arrowStep, this, (value) => {
      if (this.displayWords) {
        if (value === DOWN) {
          const index = this.activeOption + 1;
          this.activeOption = index === this.options.length ? this.activeOption : index;
        }
        else if (value === UP) {
          this.activeOption = Math.max(0, this.activeOption - 1);
        }
      }
    })
  }

  step(deltaTime: number, root?: Main): void {
    if (this.showCountdown > 0 && this.showCountdown - deltaTime <= 0) {
      this.selectionArrow.stepEntry(deltaTime, root!);
      this.selectionArrow.animations?.play('default');
      this.addChild(this.selectionArrow);
    }
    const { input } = root!;

    if (input.getActionJustPressed('Space'))
      if (this.displayWords) {
        this.hide();
        this.options[this.activeOption].action();
      }
      else {
        this.showCountdown = 0;
        this.canvas.parentElement?.classList.add('complete');
      }


    this.showCountdown -= deltaTime;
    this.displayWords = this.showCountdown <= 0;
  }

  private resizeDialog() {
    this.canvas.width = Math.floor(this.canvas.parentElement?.offsetWidth ?? this.canvas.width);
    this.canvas.height = Math.floor(this.canvas.parentElement?.clientHeight ?? this.canvas.height);
  }

  hide() {
    this.canvas.parentElement?.classList.add('hidden', 'complete');
  }

  show() {
    console.info(this.canvas.parentElement?.classList);
    this.canvas.parentElement?.classList.remove('hidden');

    console.info('after', this.canvas.parentElement?.classList);
  }

  private getFontSprites(): SpriteFontProps[][] {
    const message = Object.values(this.options).map((m) => m.text);
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
    if (this.displayWords) {
      const positionOffset = position.add(this.position);
      const yOffset = this.activeOption * 2;
      this.selectionArrow.draw(ctx, new Vector2(0, gridCells(yOffset) + yOffset));
      this.drawImage(ctx, positionOffset);
    }
  }

  drawImage(ctx: CanvasRenderingContext2D, position: Vector2): void {
    const PADDING_LEFT = 56;
    const PADDING_TOP = 18;
    const LINE_MAX_WIDTH = 240;
    const LINE_VERTICAL_HEIGHT = 38;

    let cursorX = position.x + PADDING_LEFT;
    let cursorY = position.y + PADDING_TOP;
    let currentShowIndex = 0;

    for (let index = 0; index < this.optionWords.length; index++) {
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
          sprite.draw(ctx, drawPosition);

          cursorX += width * sprite.scale + 1;
          currentShowIndex += 1;
        });

        cursorX += 3;
      });
      cursorX = position.x + PADDING_LEFT;
      cursorY += LINE_VERTICAL_HEIGHT;
    }
  }
}
