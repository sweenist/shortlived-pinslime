import { DOWN, UP } from '../../constants';
import { signals, soundTriggers } from '../../events/eventConstants';
import { gameEvents } from '../../events/Events';
import { gameState } from '../../game/GameState';
import { Animations } from '../../gameEngine/Animations';
import { FrameIndexPattern } from '../../gameEngine/animations/FrameIndexPattern';
import { GameObject } from '../../gameEngine/GameObject';
import type { Main } from '../../gameEngine/Main';
import { Sprite } from '../../gameEngine/Sprite';
import { resources } from '../../Resources';
import type { OptionMenuParams, OptionActions, Direction } from '../../types';
import type { animationConfiguration } from '../../types/animationTypes';
import { gridCells } from '../../utils/grid';
import { fontSize, Vector2 } from '../../utils/vector';
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
  timeUntilDisplayed: number;
  isActing: boolean = false;


  constructor(options: OptionMenuParams) {
    super();

    this.canvas = document.querySelector<HTMLCanvasElement>(options.canvasId)!;
    this.canvas.parentElement?.addEventListener('resize', this.resizeDialog)
    this.canvas.parentElement?.classList.remove('complete', 'opening');

    this.options = options.options
    this.drawLayer = 'USER_INTERFACE';

    this.labels = Object.values((this.options).map((option, index) => {
      return new Label({
        scale: 3,
        text: option.text,
        position: new Vector2(52, (index * 36) + 18)
      });
    }))

    this.timeUntilDisplayed = 2100;
    this.selectionArrow = new Sprite({
      resource: resources.images['cursor'],
      frameColumns: 2,
      frameSize: fontSize,
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
        const canMove = index !== this.options.length
        if (canMove) {
          this.activeOption = index;
          gameEvents.emit(soundTriggers.playMoveCursor);
        }
      }
      else if (value === UP) {
        if (this.activeOption > 0) gameEvents.emit(soundTriggers.playMoveCursor);
        this.activeOption = Math.max(0, this.activeOption - 1);
      }
      const yOffset = (this.activeOption * 2) + 1;
      this.selectionArrow.position = new Vector2(gridCells(1), gridCells(yOffset) + yOffset + 3);
    });

    gameEvents.on<Vector2>(signals.gameAction, this, (pointer) => {
      if (!this.displayWords || this.isActing) return;

      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const relativePosition = new Vector2(
        Math.floor((pointer.x - rect.left) * scaleX),
        Math.floor((pointer.y - rect.top) * scaleY)
      );
      const hitLabelIndex = this.labels.findIndex((label) => label.pointerCollides(relativePosition));

      if (hitLabelIndex > -1) {
        this.activeOption = hitLabelIndex;
        this.perform();
      }
    });
  }

  step(deltaTime: number, root?: Main): void {
    if (this.timeUntilDisplayed > 0 && this.timeUntilDisplayed - deltaTime <= 0) {
      this.displayMenu(deltaTime, root!);
      this.complete();
    }
    const { input } = root!;

    if (input.getActionJustPressed('Space') && !this.isActing)
      if (this.displayWords) {
        this.perform();
      }
      else {
        this.timeUntilDisplayed = 0;
        this.complete();
        this.displayMenu(deltaTime, root!);
      }

    this.timeUntilDisplayed -= deltaTime;
    this.displayWords = this.timeUntilDisplayed <= 0;
  }

  private resizeDialog() {
    this.canvas.width = Math.floor(this.canvas.parentElement?.offsetWidth ?? this.canvas.width);
    this.canvas.height = Math.floor(this.canvas.parentElement?.clientHeight ?? this.canvas.height);
  }

  hide(): void {
    this.canvas.parentElement?.classList.add('hidden', 'complete');
    this.canvas.parentElement?.classList.remove('opening');
  }

  complete(): void {
    this.canvas.parentElement?.classList.add('complete');
    this.canvas.parentElement?.classList.remove('opening');
  }

  show(): void {
    this.canvas.parentElement?.classList.remove('hidden');
    this.canvas.parentElement?.classList.add('opening');
  }

  displayMenu(deltaTime: number, root: Main): void {
    this.addChild(this.selectionArrow);
    this.selectionArrow.stepEntry(deltaTime, root);
    this.selectionArrow.animations?.play('default');
    this.labels.forEach((label) => this.addChild(label));
  }

  perform() {
    const option = this.options[this.activeOption];
    if (option.actOnState && gameState.current != option.actOnState) {
      let eventId: number;
      this.isActing = true;
      gameEvents.emit(soundTriggers.playSelectionConfirmed);
      gameState.next();
      this.selectionArrow.isVisible = false;
      this.labels[this.activeOption].isBlinking = true;

      eventId = gameEvents.on(signals.stateChanged, this, (stateName) => {
        if (stateName === option.actOnState) {
          this.hide()
          option.action();
          gameEvents.off(eventId);
          this.isActing = false;
        }
        else {
          console.warn("State change happened [current], [trigger]", stateName, option.actOnState)
        }
      })
    }
    else {
      this.hide();
      this.options[this.activeOption].action();
    }
  }
}
