import { Slime } from '../actors/Slime';
import {
  Level,
  type ResourceConfig,
} from '../gameEngine/Level';
import { resources } from '../Resources';
import { gridCells } from '../utils/grid';
import { Vector2 } from '../utils/vector';
import Obstacle from '../objects/Obstacles/Obstacle';
import { Paddle } from '../objects/Paddle/Paddle';
import type { deflectionCoefficient, Direction, DirectionShift, ItemConfig, MapConfig, PaddleLocations, TileConfig } from '../types';
import { Ramp } from '../objects/Obstacles/Ramp';
import { PullKnob } from '../objects/PullKnob/PullKnob';
import { Sprite } from '../gameEngine/Sprite';
import tiledMap from './config/level0.map.json';
import { Stopwatch } from '../objects/Stopwatch/Stopwatch';
import { Item } from '../objects/Item/Item';
import type { ItemEventMetaData } from '../types/eventTypes';
import { signals } from '../events/eventConstants';
import { gameEvents } from '../events/Events';
import type { LevelConfiguration } from './configurationManager';
import { OptionDialog } from '../objects/TextBox/OptionDialog';

const TILE_HEIGHT = 16 as const;
const TILE_WIDTH = 16 as const

export class Pinball extends Level {
  mapAddresses: string[] = [];
  score: number = 0;
  optionsMenu: OptionDialog | undefined;
  levelConfiguration: LevelConfiguration;

  constructor(params: LevelConfiguration) {
    super(params);

    this.levelConfiguration = params;

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
      itemConfig,
    } = this.levelConfiguration.levelConfig;

    this.buildMap(resourceConfig, tileConfig);

    Object.entries(paddles as unknown as PaddleLocations).forEach(([direction, locations]) => {
      locations.forEach((location: { x: number; y: number }) => {
        const paddleObject = new Paddle({
          direction: direction as keyof typeof DirectionShift,
          position: new Vector2(gridCells(location.x), gridCells(location.y))
        });
        this.addChild(paddleObject);
      });
    });

    itemConfig.forEach((item: ItemConfig) => {
      const collectible = new Item({
        position: Vector2.fromGridPoint(item.location),
        image: item.image,
        pointValue: item.pointValue
      });
      this.addChild(collectible);
    })

    const pullknobPosition = new Vector2(gridCells(pullknobConfig.location.x), gridCells(pullknobConfig.location.y))
    const pullknob = new PullKnob(pullknobPosition);
    this.addChild(pullknob);

    const slimePosition = new Vector2(gridCells(slimeConfig.location.x), gridCells(slimeConfig.location.y))
    const slime = new Slime(slimePosition, slimeConfig.speed);
    this.addChild(slime);

    const stopwatch = new Stopwatch({ position: slimePosition.add(new Vector2(gridCells(-4), gridCells(-2))) });
    this.addChild(stopwatch);
  }

  ready(): void {
    gameEvents.on<ItemEventMetaData>(signals.slimeItemCollect, this, ({ points }) => {
      this.score += points ?? 0;
    });
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
