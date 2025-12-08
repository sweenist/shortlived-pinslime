import { GameObject } from "../../gameEngine/GameObject";
import type { Main } from "../../gameEngine/Main";
import { Sprite, type SpriteParams } from "../../gameEngine/Sprite";
import { resources } from "../../Resources";
import type { DrawLayers } from "../../types";
import { fontSize, Vector2 } from "../../utils/vector";
import { getCharacterFrame, getCharacterWidth } from "./SpriteMapping";

const BLINK_RATE = 125;

type SpriteFontProps = {
  wordWidth: number;
  chars: {
    width: number;
    sprite: Sprite;
  }[];
};

type LabelProps = {
  text: string;
  scale?: number;
  position?: Vector2;
  drawLayer?: DrawLayers;
  name?: string
}

export class Label extends GameObject {
  labelSprites!: SpriteFontProps[];
  spriteConfig: SpriteParams;
  boundingBoxMaxima: Vector2;
  isBlinking: boolean = false;
  blinkTimer: number = 0;

  constructor(params: LabelProps) {
    super(params.position);

    this.drawLayer = params.drawLayer ?? 'USER_INTERFACE';
    this.name = params.name ?? `${params.text}-label`;
    this.spriteConfig = {
      resource: resources.images['font'],
      frameColumns: 13,
      frameRows: 5,
      frameSize: fontSize,
      scale: params.scale
    }

    this.labelSprites = this.getFontSprites(params.text);
    this.boundingBoxMaxima = this.getBoundMaxima();
  }

  private getFontSprites(labelText: string): SpriteFontProps[] {
    return labelText.split(' ').map((word) => {
      let wordWidth = 0;
      const chars = word.split('').map((char) => {
        const charWidth = getCharacterWidth(char);
        wordWidth += charWidth;

        return {
          width: charWidth,
          sprite: new Sprite({
            ...this.spriteConfig,
            name: char,
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

  private getBoundMaxima(): Vector2 {
    const xMax = this.labelSprites.reduce((prop, next) => {
      return prop += next.wordWidth * (this.spriteConfig.scale ?? 1) + 1
    }, 0) + this.position.x;

    const yMax = (this.spriteConfig.frameSize?.y ?? 8) * (this.spriteConfig.scale ?? 1) + this.position.y
    return new Vector2(xMax, yMax);
  }

  private get shouldRender() {
    return Math.ceil(this.blinkTimer / BLINK_RATE) % 2 === 0;
  }

  step(deltaTime: number, _root?: Main): void {
    if (this.isBlinking) {
      this.blinkTimer += deltaTime;
    }
  }

  drawImage(ctx: CanvasRenderingContext2D, position: Vector2): void {
    if (this.isBlinking && !this.shouldRender) return;
    let cursorX = position.x;
    let currentShowIndex = 0;

    this.labelSprites.forEach((word) => {
      word.chars.forEach((char) => {
        const { width, sprite } = char;
        const widthCharOffset = cursorX - 5;

        const drawPosition = new Vector2(widthCharOffset, position.y);
        sprite.draw(ctx, drawPosition);

        cursorX += width * sprite.scale + 1;
        currentShowIndex += 1;
      });

      cursorX += 3;
    });
  }

  pointerCollides(relativePosition: Vector2): boolean {
    return (
      relativePosition.x >= this.position.x
      && relativePosition.x <= this.boundingBoxMaxima.x
      && relativePosition.y >= this.position.y
      && relativePosition.y <= this.boundingBoxMaxima.y
    );
  }
}