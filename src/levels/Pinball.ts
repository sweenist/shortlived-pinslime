import { Slime } from '../actors/Slime';
import {
  Level,
  type LevelParams,
  type ResourceConfig,
} from '../gameEngine/Level';
import { resources } from '../Resources';
import { gridCells } from '../utils/grid';
import { Vector2 } from '../utils/vector';
import Obstacle from '../objects/Obstacles/Obstacle';
import { Paddle } from '../objects/Paddle/Paddle';
import type { deflectionCoefficient, Direction, DirectionShift } from '../types';
import { Ramp } from '../objects/Obstacles/Ramp';
import { PullKnob } from '../objects/PullKnob/PullKnob';
import { Sprite } from '../gameEngine/Sprite';

import levelConfig from './config/level1.config.json';
import tiledMap from './config/level1.map.json';

type TileConfig = {
  resourceName: string;
  frameIndex: number;
  deflection?: number;
  approaches?: string[];
  isSolid?: boolean;
};

type MapConfig = {
  data: number[];
  width: number;
  height: number;
}

const TILE_HEIGHT = 16 as const;
const TILE_WIDTH = 16 as const

export class Pinball extends Level {
  mapAddresses: string[] = [];

  constructor(params: LevelParams) {
    super({ actorPosition: params.actorPosition });

    this.background = new Sprite({
      resource: resources.images['levelBackground'],
      frameSize: new Vector2(480, 320)
    });

    const {
      paddles,
      resourceConfig,
      tileConfig,
      pullknobConfig,
      slimeConfig,
      shadowConfig,
    } = levelConfig;

    this.buildMap(resourceConfig, tileConfig);

    paddles.forEach((paddle) => {
      const paddleObject = new Paddle({
        direction: paddle.direction as keyof typeof DirectionShift,
        position: new Vector2(gridCells(paddle.location.x), gridCells(paddle.location.y))
      });
      this.addChild(paddleObject);
    });

    const pullknobPosition = new Vector2(gridCells(pullknobConfig.location.x), gridCells(pullknobConfig.location.y))
    const pullknob = new PullKnob(pullknobPosition);
    this.addChild(pullknob);

    const slimePosition = new Vector2(gridCells(slimeConfig.location.x), gridCells(slimeConfig.location.y))
    const slime = new Slime(slimePosition, slimeConfig.speed, shadowConfig);
    this.addChild(slime);
  }

  buildMap(resourceConfigs: ResourceConfig[], tileConfig: { [key: number]: TileConfig }) {
    const { data, width, height } = tiledMap.layers[0] as MapConfig;

    this.mapSize = new Vector2(width * TILE_WIDTH, height * TILE_HEIGHT);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tileId = data[y * width + x];
        if (tileId === 0) continue; // Skip empty tiles

        // Find the resource config that contains this tile ID
        const resourceConfig = resourceConfigs.find(({ startIndex, frameConfig }) => {
          startIndex = startIndex || 0;
          const endIndex = startIndex + (frameConfig.columns * frameConfig.rows);
          return tileId >= startIndex && tileId < endIndex;
        });

        if (!resourceConfig) {
          console.warn("No resource config for tile:", tileId);
          continue;
        }

        const tilecfg = tileConfig[tileId];
        if (!tilecfg) {
          console.warn("No tile config for ID:", tileId);
          continue;
        }

        const position = new Vector2(gridCells(x), gridCells(y));
        const obstacleParams = {
          position,
          isSolid: tilecfg.isSolid ?? true,
          content: {
            resource: resources.images[tilecfg.resourceName],
            frameColumns: resourceConfig.frameConfig.columns,
            frameRows: resourceConfig.frameConfig.rows,
            frameSize: Vector2.fromPoint(resourceConfig.frameConfig.size),
            frameIndex: tilecfg.frameIndex
          }
        };

        const tile = !!tilecfg.deflection
          ? new Ramp({
            ...obstacleParams,
            deflection: tilecfg.deflection as deflectionCoefficient,
            approaches: tilecfg.approaches as Direction[]
          })
          : new Obstacle(obstacleParams);
        tile.drawLayer = 'GROUND';

        this.addChild(tile);
      }
    }
  }
}
