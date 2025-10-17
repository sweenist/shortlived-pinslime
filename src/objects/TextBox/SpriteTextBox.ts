import { signals } from '../../events/eventConstants';
import { gameEvents } from '../../events/Events';
import { GameObject } from '../../gameEngine/GameObject';
import type { Main } from '../../gameEngine/Main';
import { Sprite } from '../../gameEngine/Sprite';
import { resources } from '../../Resources';
import type { DialogueScenario } from '../../types';
import { Vector2 } from '../../utils/vector';
import { getCharacterFrame, getCharacterWidth } from './SpriteMapping';

type SpriteFontProps = {
  wordWidth: number;
  chars: {
    width: number;
    sprite: Sprite;
  }[];
};

export class SpriteTextBox extends GameObject {
  content: DialogueScenario;
  backdrop: Sprite;
  words: SpriteFontProps[];
  showingIndex: number = 0;
  textSpeed: number = 64 as const;
  timeUntilNextShow: number = 128;
  finalIndex: number;
  portrait?: Sprite | null;

  constructor(content: DialogueScenario) {
    super(new Vector2(32, 112));

    this.drawLayer = 'USER_INTERFACE';
    this.content = content;

    this.backdrop = new Sprite({
      resource: resources.images['textbox'],
      frameSize: new Vector2(256, 64),
    });

    this.portrait = content.portraitFrame
      ? new Sprite({
          resource: resources.images.portraits,
          frameColumns: 4,
          frameIndex: content.portraitFrame!,
        })
      : null;

    this.words = this.getFontSprites();
    this.finalIndex = this.words.reduce(
      (acc, word) => acc + word.chars.length,
      0
    );
  }

  step(deltaTime: number, root?: Main): void {
    const { input } = root!;
    if (input.getActionJustPressed('Space')) {
      if (this.showingIndex < this.finalIndex) {
        this.showingIndex = this.finalIndex;
        return;
      }

      // Close textbox since all text would have been revealed
      gameEvents.emit(signals.endTextInteraction);
    }

    this.timeUntilNextShow -= deltaTime;
    if (this.timeUntilNextShow <= 0) {
      this.showingIndex += 2;
      this.timeUntilNextShow = this.textSpeed;
    }
  }

  private getFontSprites(): SpriteFontProps[] {
    const { message } = this.content;
    return message.split(' ').map((word) => {
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
            frameRows: 6,
            frameIndex: getCharacterFrame(char),
          }),
        };
      });
      return {
        wordWidth,
        chars,
      };
    });
  }

  draw(ctx: CanvasRenderingContext2D, position: Vector2): void {
    const positionOffset = position.add(this.position);
    this.backdrop.draw(ctx, positionOffset);
    this.drawImage(ctx, positionOffset);
  }

  drawImage(ctx: CanvasRenderingContext2D, position: Vector2): void {
    const PADDING_LEFT = this.portrait ? 27 : 7;
    const PADDING_TOP = this.portrait ? 9 : 7;
    const LINE_MAX_WIDTH = 240;
    const LINE_VERTICAL_HEIGHT = 14;

    let cursorX = position.x + PADDING_LEFT;
    let cursorY = position.y + PADDING_TOP;
    let currentShowIndex = 0;

    this.words.forEach((word) => {
      const spaceRemaining = position.x + LINE_MAX_WIDTH - cursorX;
      if (spaceRemaining < word.wordWidth) {
        cursorY += LINE_VERTICAL_HEIGHT;
        cursorX = position.x + PADDING_LEFT;
      }
      word.chars.forEach((char) => {
        if (currentShowIndex > this.showingIndex) return;

        const { width, sprite } = char;
        const widthCharOffset = cursorX - 5;

        const drawPosition = new Vector2(widthCharOffset, cursorY);
        sprite.draw(ctx, drawPosition);

        cursorX += width + 1;
        currentShowIndex += 1;
      });

      cursorX += 3;
    });
    if (this.portrait) {
      const portraitPosition = new Vector2(position.x + 7, position.y + 7);
      this.portrait.draw(ctx, portraitPosition);
    }
  }
}
