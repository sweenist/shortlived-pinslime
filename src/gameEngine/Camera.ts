import { gameEvents } from '../events/Events';
import { GameObject } from './GameObject';
import { Vector2 } from '../utils/vector';
import { Level } from './Level';
import { signals } from '../events/eventConstants';
import type { Movement } from '../types';
import type { Main } from './Main';

export class Camera extends GameObject {
  canvas: HTMLCanvasElement;
  canvasWidth: number;
  canvasHeight: number;
  halfActor = 8;
  clampToMap: boolean

  constructor(canvas: HTMLCanvasElement, clampToMap: boolean) {
    super();
    this.canvas = canvas;
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;

    this.canvas.addEventListener('resize', () => {
      this.canvasWidth = canvas.width;
      this.canvasHeight = canvas.height;
    });

    this.clampToMap = clampToMap;
  }

  ready(): void {
    gameEvents.on<Movement>(signals.slimePosition, this, ({ position }) => {
      this.centerPositionOnTarget(position);
    });

    gameEvents.on<Level>(signals.levelChanged, this, (level) => {
      this.centerPositionOnTarget(level.actorPosition);
    });
  }

  centerPositionOnTarget(target: Vector2) {
    const halfWidth = -this.halfActor + this.canvasWidth / 2;
    const halfHeight = -this.halfActor + this.canvasHeight / 2;

    this.position = new Vector2(-target.x + halfWidth, -target.y + halfHeight);
    if (this.clampToMap) this.clamp()

  }

  clamp() {
    const { level } = this.parent as Main;

    if (!level || !level.mapSize) return;

    const minX = -level.mapSize.x + this.canvasWidth;
    const minY = -level.mapSize.y + this.canvasHeight;

    if (this.position.x > 0) this.position.x = 0;
    if (this.position.y > 0) this.position.y = 0;
    if (this.position.x < minX) this.position.x = minX;
    if (this.position.y < minY) this.position.y = minY;
  }
}
