import { GameObject } from './GameObject';
import type { Sprite } from './Sprite';
import { gameEvents } from '../events/Events';
import { type Vector2Interface, Vector2 } from '../utils/vector';

export interface LevelConfig {
  walls: { x: number; y: number }[];
  obstacles?: {};
}

export interface FrameConfig {
  size: Vector2Interface;
  columns: number;
  rows: number;
}
export interface ResourceConfig {
  name: string;
  startIndex?: number;
  frameConfig: FrameConfig;
}

export type LevelParams = {
  actorPosition: Vector2;
};

export class Level extends GameObject {
  background?: Sprite;
  walls: Set<string> = new Set<string>();
  actorPosition: Vector2;
  mapSize?: Vector2

  constructor(params: LevelParams, config?: LevelConfig) {
    super();

    this.actorPosition = params.actorPosition;
    this.defineWalls(config);
  }

  destroy(): void {
    console.debug(`Unsubscribing ${this.constructor.name} event listeners`);
    gameEvents.unsubscribe(this);
    super.destroy();
  }

  defineWalls(config?: LevelConfig) {
    config?.walls.forEach(({ x, y }) => {
      this.walls.add(`x: ${x}, y: ${y}`);
    });
  }
}
