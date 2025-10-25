import { UP, DOWN, LEFT, RIGHT } from '../constants';
import { signals } from '../events/eventConstants';
import { gameEvents } from '../events/Events';
import type { Direction } from '../types';

export class GameInput {
  directions: Direction[] = [];
  keys: { [key: string]: boolean } = {};
  lastKeys: { [key: string]: boolean } = {};
  debugMessage: string = '';
  consolate?: () => void;

  constructor() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.key === 'ArrowUp' || e.key === 'w') {
        this.onArrowPressed(UP);
      }
      if (e.key === 'ArrowDown' || e.key === 's') {
        this.onArrowPressed(DOWN);
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        this.onArrowPressed(LEFT);
      }
      if (e.key === 'ArrowRight' || e.key === 'd') {
        this.onArrowPressed(RIGHT);
      }
      if (e.key === 'D') {
        if (this.consolate) return this.consolate();
        this.printDebug();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;

      if (e.key === 'ArrowUp' || e.key === 'w') {
        this.onArrowReleased(UP);
      }
      if (e.key === 'ArrowDown' || e.key === 's') {
        this.onArrowReleased(DOWN);
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        this.onArrowReleased(LEFT);
      }
      if (e.key === 'ArrowRight' || e.key === 'd') {
        this.onArrowReleased(RIGHT);
      }
    });
  }

  get direction() {
    return this.directions[0];
  }

  update() {
    this.lastKeys = { ...this.keys };
  }

  getActionJustPressed(keyCode: string) {
    const justPressed = this.keys[keyCode] && !this.lastKeys[keyCode];
    return justPressed;
  }

  onArrowPressed(direction: Direction) {
    if (this.directions.indexOf(direction) === -1) {
      this.directions.unshift(direction);
    }
    gameEvents.emit(signals.arrowMovement, direction);
  }

  onArrowReleased(direction: Direction) {
    const index = this.directions.indexOf(direction);
    if (index > -1) {
      this.directions.splice(index, 1);
    }
  }

  printDebug() {
    console.debug(this.debugMessage);
  }

  debugAction() {
    this.consolate?.();
  }
}
