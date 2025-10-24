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
import type { deflectionCoefficient, DirectionShift } from '../types';
import { Ramp } from '../objects/Obstacles/Ramp';
import { PullKnob } from '../objects/PullKnob/PullKnob';
import { Sprite } from '../gameEngine/Sprite';

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

    this.background = new Sprite({
      resource: resources.images['levelBackground'],
      frameSize: new Vector2(480, 320)
    });

    const {
      paddles,
      resourceConfig,
      mapConfig,
      pullknobConfig,
      slimeConfig,
      shadowConfig,
    } = levelConfig;

    this.buildMap(resourceConfig, mapConfig);

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
        const obstacleParams = {
          position,
          isSolid: tilecfg.isSolid ?? true,
          content: {
            resource: resources.images[tilecfg.resourceName],
            frameColumns: fc?.frameConfig.columns,
            frameRows: fc?.frameConfig.rows,
            frameSize: Vector2.fromPoint(fc?.frameConfig.size),
            frameIndex: tilecfg.frameIndex,
          }
        };

        const tile = !!tilecfg.deflection
          ? new Ramp({ ...obstacleParams, deflection: tilecfg.deflection as deflectionCoefficient })
          : new Obstacle(obstacleParams);
        tile.drawLayer = 'GROUND';

        this.addChild(tile);
      }
    }
  }
}
