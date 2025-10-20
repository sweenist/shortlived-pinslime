import { Hero } from '../actors/Hero';
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
  turns?: 'NONE' | 'CCW' | 'CW',
  isSolid?: boolean
};

export class Pinball extends Level {
  mapAddresses: string[] = [];
  fancyMap: { [key: string]: tileConfig } = {
    W0: { resourceName: 'walls', frameIndex: 0 },
    W1: { resourceName: 'walls', frameIndex: 1 },
    W2: { resourceName: 'walls', frameIndex: 2 },
    W3: { resourceName: 'walls', frameIndex: 3 },
    W4: { resourceName: 'walls', frameIndex: 6 },
    W5: { resourceName: 'walls', frameIndex: 7 },
    W6: { resourceName: 'walls', frameIndex: 8 },
    W7: { resourceName: 'walls', frameIndex: 9 },
    W8: { resourceName: 'walls', frameIndex: 12 },
    W9: { resourceName: 'walls', frameIndex: 13 },
    WA: { resourceName: 'walls', frameIndex: 14 },
    WB: { resourceName: 'walls', frameIndex: 15 },
    WC: { resourceName: 'walls', frameIndex: 18 },
    WD: { resourceName: 'walls', frameIndex: 19 },
    WE: { resourceName: 'walls', frameIndex: 20 },
    WF: { resourceName: 'walls', frameIndex: 21 },
    BL: { resourceName: 'walls', frameIndex: 10, isSolid: false, },
    R0: { resourceName: 'walls', frameIndex: 27, isSolid: false, turns: 'CCW' },
    R1: { resourceName: 'walls', frameIndex: 28, isSolid: false, turns: 'CCW' },
    R2: { resourceName: 'walls', frameIndex: 33, isSolid: false, turns: 'CCW' },
    R3: { resourceName: 'walls', frameIndex: 34, isSolid: false, turns: 'CCW' },
    RA: { resourceName: 'walls', frameIndex: 25 },
    RB: { resourceName: 'walls', frameIndex: 26 },
    RC: { resourceName: 'walls', frameIndex: 31 },
    RD: { resourceName: 'walls', frameIndex: 32 },
    RP: { resourceName: 'walls', frameIndex: 37, isSolid: false, turns: 'CCW' },
    RQ: { resourceName: 'walls', frameIndex: 38, isSolid: false, turns: 'CCW' },
    RR: { resourceName: 'walls', frameIndex: 43, isSolid: false, turns: 'CCW' },
    RS: { resourceName: 'walls', frameIndex: 44, isSolid: false, turns: 'CCW' },
    RT: { resourceName: 'walls', frameIndex: 48, isSolid: false, turns: 'CCW' },
    RU: { resourceName: 'walls', frameIndex: 49, isSolid: false, turns: 'CCW' },
    RV: { resourceName: 'walls', frameIndex: 50, isSolid: false, turns: 'CCW' },
    RW: { resourceName: 'walls', frameIndex: 51, isSolid: false, turns: 'CCW' },
    '00': { resourceName: 'walls', frameIndex: 4, isSolid: false },
    E0: { resourceName: 'walls', frameIndex: 39 },
    EN: { resourceName: 'walls', frameIndex: 40 },
    E1: { resourceName: 'walls', frameIndex: 41 },
    E2: { resourceName: 'walls', frameIndex: 23 },
    EE: { resourceName: 'walls', frameIndex: 29 },
    E3: { resourceName: 'walls', frameIndex: 35 },
    E4: { resourceName: 'walls', frameIndex: 45 },
    ES: { resourceName: 'walls', frameIndex: 46 },
    E5: { resourceName: 'walls', frameIndex: 47 },
    E6: { resourceName: 'walls', frameIndex: 5 },
    EW: { resourceName: 'walls', frameIndex: 11 },
    E7: { resourceName: 'walls', frameIndex: 17 },
    WW: { resourceName: 'walls', frameIndex: 24 },
    WX: { resourceName: 'walls', frameIndex: 30 },
    WY: { resourceName: 'walls', frameIndex: 42 },
    WZ: { resourceName: 'walls', frameIndex: 36 },
  };

  constructor(params: LevelParams) {
    super({ actorPosition: params.actorPosition });

    const {
      paddles,
      resourceConfig,
    } = levelConfig;

    this.buildMap(resourceConfig);

    paddles.forEach((paddle) => {
      const paddleObject = new Paddle({
        direction: paddle.direction as keyof typeof DirectionShift,
        position: new Vector2(gridCells(paddle.location.x), gridCells(paddle.location.y))
      });
      this.addChild(paddleObject);
    });


    const hero = new Hero(params.actorPosition);
    this.addChild(hero);
  }

  buildMap(config: ResourceConfig[]) {
    const lines = mapContent.split('\n');
    const columns = lines[0].split(',').length;
    const rows = lines.length;

    this.mapAddresses = lines.flatMap((s) => s.split(','));

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const mapTile = this.mapAddresses[y * columns + x];
        const tilecfg = this.fancyMap[mapTile];
        const fc = config.find((c) => c.name === tilecfg.resourceName);
        if (!fc) continue;

        const position = new Vector2(gridCells(x), gridCells(y));
        const tile = new Obstacle({
          position,
          isSolid: tilecfg.isSolid ?? true,
          turns: tilecfg.turns ?? 'NONE',
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
