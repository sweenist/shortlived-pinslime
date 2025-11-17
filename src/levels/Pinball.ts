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
import type { deflectionCoefficient, Direction, DirectionShift, ItemConfig, MapConfig, PaddleLocations, TileConfig } from '../types';
import { Ramp } from '../objects/Obstacles/Ramp';
import { PullKnob } from '../objects/PullKnob/PullKnob';
import { Sprite } from '../gameEngine/Sprite';
import levelConfig from './config/level0.config.json';
import tiledMap from './config/level0.map.json';
import { Stopwatch } from '../objects/Stopwatch/Stopwatch';
import { Item } from '../objects/Item/Item';
import type { ItemEventMetaData } from '../types/eventTypes';
import { signals } from '../events/eventConstants';
import { gameEvents } from '../events/Events';
import type { LevelConfiguration } from './configurationManager';
import { OptionDialog } from '../objects/TextBox/OptionDialog';
import { STATE_DEAD, STATE_GAMEOVER, STATE_NAMES } from '../constants';
import { Title } from '../game/Title';
import { Animations } from '../gameEngine/Animations';
import { FrameIndexPattern } from '../gameEngine/animations/FrameIndexPattern';
import { DEATH } from '../actors/slimeAnimations';

const TILE_HEIGHT = 16 as const;
const TILE_WIDTH = 16 as const

export class Pinball extends Level {
  mapAddresses: string[] = [];
  score: number = 0;
  optionsMenu: OptionDialog | undefined;
  deathThroes: Sprite;
  slime: Slime;


  constructor(params: LevelParams & { levelConfig: LevelConfiguration }) {
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
      itemConfig,
    } = levelConfig;

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
    this.slime = new Slime(slimePosition, slimeConfig.speed);
    this.addChild(this.slime);

    const stopwatch = new Stopwatch({ position: slimePosition.add(new Vector2(gridCells(-4), gridCells(-2))) });
    this.addChild(stopwatch);

    this.deathThroes = new Sprite({
      resource: resources.images['slimeDeath'],
      frameSize: new Vector2(128, 128),
      frameColumns: 8,
      frameRows: 7,
      position: new Vector2(-64, -112),
      animations: new Animations(
        { death: new FrameIndexPattern(DEATH), }
      )
    });
  }

  ready(): void {
    gameEvents.on<ItemEventMetaData>(signals.slimeItemCollect, this, ({ points }) => {
      this.score += points ?? 0;
    });

    gameEvents.on<typeof STATE_NAMES[number]>(signals.stateChanged, this, (value) => {
      if (value === STATE_DEAD) {
        this.addChild(this.deathThroes);
        this.deathThroes.position.add(this.slime.position);
        this.deathThroes.animations?.playOnce('death', () => console.info('KABOOM'));
        if (!this.slime.isLevelBuilding) {
          this.slime.destroy();
        }
      }
      if (value === STATE_GAMEOVER) {
        this.removeChild(this.deathThroes);
        this.optionsMenu = new OptionDialog({
          canvasId: '#options-canvas',
          options: {
            0: {
              text: 'Retry',
              action: () => {
                // gameState.set(STATE_INITIAL);
                console.info('retry')
              }
            },
            1: {
              text: 'Quit',
              action: () => {
                // gameState.set(STATE_TITLE);
                gameEvents.emit(signals.levelChanging, new Title())
              }
            }
          }
        });
      }
    })
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
