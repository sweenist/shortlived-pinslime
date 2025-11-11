
import type { ResourceConfig } from '../gameEngine/Level';
import type { ItemConfig, MapConfig, PaddleLocations, point, TileConfig } from '../types';
import level0 from './config/level0.config.json';
import map0 from './config/level0.map.json';
import level1 from './config/level1.config.json';
import map1 from './config/level1.map.json';

export type LevelConfiguration = {
  tiledMap: MapConfig;
  levelConfig:
  & { [key: number]: TileConfig }
  & { [key: number]: ItemConfig }
  & PaddleLocations
  & { [key: number]: ResourceConfig }
  & {
    pullknobConfig: { location: point },
    slimeConfig: { location: point, speed: number }
  }
}

export const configurationManager: LevelConfiguration[] = [
  { tiledMap: map0.layers[0], levelConfig: level0 },
  { tiledMap: map1.layers[0], levelConfig: level1 }
]