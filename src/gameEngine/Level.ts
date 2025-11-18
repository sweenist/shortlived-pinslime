import { GameObject } from './GameObject';
import type { Sprite } from './Sprite';
import { gameEvents } from '../events/Events';
import { type Vector2Interface, Vector2 } from '../utils/vector';
import type { LevelConfiguration } from '../levels/configurationManager';

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

export class Level extends GameObject {
  background?: Sprite;
  walls: Set<string> = new Set<string>();
  actorPosition: Vector2;
  mapSize?: Vector2

  constructor(params: LevelConfiguration) {
    super();

    this.actorPosition = Vector2.fromGridPoint(params.levelConfig.slimeConfig.location);
  }

  destroy(): void {
    console.debug(`Unsubscribing ${this.constructor.name} event listeners`);
    gameEvents.unsubscribe(this);
    super.destroy();
  }
}
