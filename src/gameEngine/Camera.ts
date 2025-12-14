import { gameEvents } from '../events/Events';
import { GameObject } from './GameObject';
import { spriteSize, Vector2 } from '../utils/vector';
import { Level } from './Level';
import { signals } from '../events/eventConstants';
import type { Movement } from '../types';
import type { Main } from './Main';
import { canvasManager } from './CanvasManager';

export class Camera extends GameObject {
  canvas: HTMLCanvasElement;
  halfActor = 8;
  halfWidth: number;
  halfHeight: number;
  clampToMap: boolean
  rectExtrema: Vector2;

  constructor(clampToMap: boolean) {
    super();
    this.canvas = canvasManager.mainCanvas;
    this.halfWidth = -this.halfActor + this.canvas.width / 2;
    this.halfHeight = -this.halfActor + this.canvas.height / 2;

    this.canvas.addEventListener('resize', () => {
      this.halfWidth = -this.halfActor + this.canvas.width / 2;
      this.halfHeight = -this.halfActor + this.canvas.height / 2;

    });

    this.rectExtrema = this.position.addPoint({ x: this.canvas.width, y: this.canvas.height });
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
    this.position = new Vector2(-target.x + this.halfWidth, -target.y + this.halfHeight);
    this.rectExtrema = this.position.addPoint({ x: this.canvas.width, y: this.canvas.height });
    if (this.clampToMap) this.clamp()

  }

  clamp() {
    const { level } = this.parent as Main;

    if (!level || !level.mapSize) return;

    const minX = -level.mapSize.x + this.canvas.width;
    const minY = -level.mapSize.y + this.canvas.height;

    if (this.position.x > 0) this.position.x = 0;
    if (this.position.y > 0) this.position.y = 0;
    if (this.position.x < minX) this.position.x = minX;
    if (this.position.y < minY) this.position.y = minY;
  }

  isWithinViewPort(worldPosition: Vector2): boolean {
    const spriteExtrema = worldPosition.add(spriteSize);

    return !(
      spriteExtrema.x < this.position.x
      || worldPosition.x > spriteExtrema.x
      || spriteExtrema.y < this.position.y
      || worldPosition.y > spriteExtrema.y
    );
  }
}
