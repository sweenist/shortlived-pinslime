
import type { ResourceConfig } from '../gameEngine/Level';
import type { ItemConfig, MapConfig, PaddleLocations, point, TileConfig } from '../types';
import level2 from './config/level2.config.json';
import map2 from './config/level2.map.json';
import level1 from './config/level1.config.json';
import map1 from './config/level1.map.json';
import fakeMap from './config/levelfake.map.json';


export type LevelConfiguration = {
  tiledMap: MapConfig;
  levelConfig:
  {
    itemConfig: ItemConfig[],
    paddles: PaddleLocations,
    tileConfig: { [key: number]: TileConfig },
    pullknobConfig: { location: point },
    resourceConfig: ResourceConfig[],
    slimeConfig: { location: point, speed: number }
  }
}

//TODO: refactor common options out, like slime, etc
export const configurationManager: LevelConfiguration[] = [
  { tiledMap: map1.layers[0], levelConfig: level1 },
  { tiledMap: map2.layers[0], levelConfig: level2 },
  { tiledMap: fakeMap.layers[0], levelConfig: level1 },
]