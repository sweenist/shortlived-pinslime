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
import { Label } from './Label';

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
  labels: Label[];
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
    this.canvas.parentElement?.classList.add('opening');

    this.options = options.options
    this.drawLayer = 'USER_INTERFACE';

    this.labels = Object.values((this.options).map((option, index) => {
      return new Label({
        scale: 3,
        text: option.text,
        position: new Vector2(52, (index * 36) + 18)
      });
    }))

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
      if (!this.displayWords) return;

      if (value === DOWN) {
        const index = this.activeOption + 1;
        this.activeOption = index === this.options.length ? this.activeOption : index;
      }
      else if (value === UP) {
        this.activeOption = Math.max(0, this.activeOption - 1);
      }
      const yOffset = (this.activeOption * 2) + 1;
      this.selectionArrow.position = new Vector2(gridCells(1), gridCells(yOffset) + yOffset + 3);
    });

    gameEvents.on<Vector2>(signals.gameAction, this, (pointer) => {
      if (!this.displayWords) return;

      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const relativePosition = new Vector2(
        Math.floor((pointer.x - rect.left) * scaleX),
        Math.floor((pointer.y - rect.top) * scaleY)
      );
      console.info('mousie', rect, scaleX, scaleY, relativePosition);
      const hitLabelIndex = this.labels.findIndex((label) => label.pointerCollides(relativePosition));
      if (hitLabelIndex > -1) {
        console.info(this.labels[hitLabelIndex].position, this.labels[hitLabelIndex].boundingBoxMaxima)
        this.hide();
        this.options[hitLabelIndex].action();
      }
    });
  }

  step(deltaTime: number, root?: Main): void {
    if (this.showCountdown > 0 && this.showCountdown - deltaTime <= 0) {
      this.addChild(this.selectionArrow);
      this.selectionArrow.stepEntry(deltaTime, root!);
      this.selectionArrow.animations?.play('default');
      this.labels.forEach((label) => this.addChild(label));
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
        this.canvas.parentElement?.classList.remove('opening');
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
    this.canvas.parentElement?.classList.remove('opening');
  }

  show() {
    console.info(this.canvas.parentElement?.classList);
    this.canvas.parentElement?.classList.remove('hidden');
    this.canvas.parentElement?.classList.add('opening');

    console.info('after', this.canvas.parentElement?.classList);
  }
}
