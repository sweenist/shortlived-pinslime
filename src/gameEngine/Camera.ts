import { gameEvents } from '../events/Events';
import { GameObject } from './GameObject';
import { CardinalVectors, Vector2 } from '../utils/vector';
import { Level } from './Level';
import { signals } from '../events/eventConstants';
import type { Movement, Direction } from '../types';
import type { Main } from './Main';

export class Camera extends GameObject {
  canvas: HTMLCanvasElement;
  canvasWidth: number;
  canvasHeight: number;
  halfActor = 8;
  halfWidth: number;
  halfHeight: number;
  clampToMap: boolean

  constructor(canvas: HTMLCanvasElement, clampToMap: boolean) {
    super();
    this.canvas = canvas;
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    this.halfWidth = -this.halfActor + this.canvasWidth / 2;
    this.halfHeight = -this.halfActor + this.canvasHeight / 2;

    this.canvas.addEventListener('resize', () => {
      this.canvasWidth = canvas.width;
      this.canvasHeight = canvas.height;
      this.halfWidth = -this.halfActor + this.canvasWidth / 2;
      this.halfHeight = -this.halfActor + this.canvasHeight / 2;

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

    gameEvents.on<Direction>(signals.arrowMovement, this, (value) => {
      this.position = this.position.add(CardinalVectors[value].negate().multiply(16));
      console.info("camera location:", this.position)
      const crosshair = new Vector2(-(this.position.x - this.halfWidth), -(this.position.y - this.halfHeight));
      console.info("Crosshair Location:", crosshair);
    })
  }

  centerPositionOnTarget(target: Vector2) {
    this.position = new Vector2(-target.x + this.halfWidth, -target.y + this.halfHeight);
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
