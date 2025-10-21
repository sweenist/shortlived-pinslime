import { Slime } from '../actors/Slime';
import {
  Level,
  type LevelParams,
  type ResourceConfig,
} from '../gameEngine/Level';
import { resources } from '../Resources';
import { gridCells } from '../utils/grid';
import { Vector2 } from '../utils/vector';
import mapContent from './config/level1.txt?raw';
import levelConfig from './config/level.config.json';
import Obstacle from '../objects/Obstacles/Obstacle';
import { Paddle } from '../objects/Paddle/Paddle';
import type { DirectionShift } from '../types';

type tileConfig = {
  resourceName: string;
  frameIndex: number;
  deflection?: number;
  isSolid?: boolean;
};

export class Pinball extends Level {
  mapAddresses: string[] = [];

  constructor(params: LevelParams) {
    super({ actorPosition: params.actorPosition });

    const {
      paddles,
      resourceConfig,
      mapConfig,
    } = levelConfig;

    this.buildMap(resourceConfig, mapConfig);

    paddles.forEach((paddle) => {
      const paddleObject = new Paddle({
        direction: paddle.direction as keyof typeof DirectionShift,
        position: new Vector2(gridCells(paddle.location.x), gridCells(paddle.location.y))
      });
      console.info(paddleObject)
      this.addChild(paddleObject);
    });


    const hero = new Slime(params.actorPosition);
    this.addChild(hero);
  }

  buildMap(config: ResourceConfig[], mapConfig: { [key: string]: tileConfig }) {
    const lines = mapContent.split('\n');
    const columns = lines[0].split(',').length;
    const rows = lines.length;

    this.mapAddresses = lines.flatMap((s) => s.split(','));

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const mapTile = this.mapAddresses[y * columns + x];
        const tilecfg = mapConfig[mapTile];
        const fc = config.find((c) => c.name === tilecfg.resourceName);
        if (!fc) continue;

        const position = new Vector2(gridCells(x), gridCells(y));
        const tile = new Obstacle({
          position,
          isSolid: tilecfg.isSolid ?? true,
          drawLayer: 'GROUND',
          deflection: tilecfg.deflection as -1 | 1 | undefined,
          content: {
            resource: resources.images[tilecfg.resourceName],
            frameColumns: fc?.frameConfig.columns,
            frameRows: fc?.frameConfig.rows,
            frameSize: Vector2.fromPoint(fc?.frameConfig.size),
            frameIndex: tilecfg.frameIndex,
          }
        });
        tile.drawLayer = 'GROUND';

        this.addChild(tile);
      }
    }
  }
}
