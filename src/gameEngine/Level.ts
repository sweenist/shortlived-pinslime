import { GameObject } from './GameObject';
import type { Sprite } from './Sprite';
import { gameEvents } from '../events/Events';
import { type Vector2Interface, Vector2 } from '../utils/vector';
import Obstacle from '../objects/Obstacles/Obstacle';
import { resources } from '../Resources';

export interface LevelConfig {
  walls: { x: number; y: number }[];
  obstacles?: {};
}

export interface GameObjectParams {
  frameIndex: number;
  imageName: string;
  isSolid?: boolean;
  positions: Vector2Interface[];
}

export interface FrameConfig {
  size: Vector2Interface;
  columns: number;
  rows: number;
}
export interface ResourceConfig {
  name: string;
  frameConfig: FrameConfig;
}

export type LevelParams = {
  actorPosition: Vector2;
};

export class Level extends GameObject {
  background?: Sprite;
  walls: Set<string> = new Set<string>();
  actorPosition: Vector2;

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

  layoutObstacles(config: ResourceConfig[], params: GameObjectParams) {
    const res = config.find((r) => r.name === params.imageName);
    if (!res) {
      throw `Cannot find ${params.imageName} in resources`;
    }
    const { frameConfig } = res;
    params.positions.forEach((position) => {
      const sprite = new Obstacle({
        isSolid: params.isSolid,
        position: Vector2.fromPoint(position),
        content: {
          resource: resources.images[params.imageName],
          frameColumns: frameConfig.columns,
          frameRows: frameConfig.rows,
          frameSize: Vector2.fromPoint(frameConfig.size),
          frameIndex: params.frameIndex,
        },
      });

      this.addChild(sprite);
    });
  }
}
