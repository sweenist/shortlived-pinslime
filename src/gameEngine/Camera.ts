import { gameEvents } from '../events/Events';
import { GameObject } from './GameObject';
import { Vector2 } from '../utils/vector';
import { Level } from './Level';
import { signals } from '../events/eventConstants';
import type { Direction, Movement } from '../types';

export class Camera extends GameObject {
  canvas: HTMLCanvasElement;
  canvasWidth: number;
  canvasHeight: number;
  halfActor = 8;

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;

    this.canvas.addEventListener('resize', () => {
      this.canvasWidth = canvas.width;
      this.canvasHeight = canvas.height;
    });
  }

  ready(): void {
    gameEvents.on<Movement>(signals.slimePosition, this, (value) => {
      if (!value) return;

      this.centerPositionOnTarget(value.position);
    });

    gameEvents.on<Level>(signals.levelChanged, this, (level) => {
      this.centerPositionOnTarget(level.actorPosition);
    });
  }

  centerPositionOnTarget(target: Vector2) {
    const halfWidth = -this.halfActor + this.canvasWidth / 2;
    const halfHeight = -this.halfActor + this.canvasHeight / 2;

    this.position = new Vector2(-target.x + halfWidth, -target.y + halfHeight);
  }
}
