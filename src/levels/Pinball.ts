import { Hero } from '../actors/Hero';
import {
  Level,
  type LevelParams,
  type ResourceConfig,
} from '../gameEngine/Level';
import { Sprite } from '../gameEngine/Sprite';
import { resources } from '../Resources';
import { gridCells } from '../utils/grid';
import { Vector2 } from '../utils/vector';
import mapContent from './config/level1.txt?raw';
import levelConfig from './config/level.config.json';

type tempType = {
  resourceName: string;
  frameIndex: number;
};

export class Pinball extends Level {
  mapAddresses: string[] = [];
  fancyMap: { [key: string]: tempType } = {
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
    BL: { resourceName: 'walls', frameIndex: 10 },
    R0: { resourceName: 'walls', frameIndex: 27 },
    R1: { resourceName: 'walls', frameIndex: 28 },
    R2: { resourceName: 'walls', frameIndex: 33 },
    R3: { resourceName: 'walls', frameIndex: 34 },
    RA: { resourceName: 'walls', frameIndex: 25 },
    RB: { resourceName: 'walls', frameIndex: 26 },
    RC: { resourceName: 'walls', frameIndex: 31 },
    RD: { resourceName: 'walls', frameIndex: 32 },
    RP: { resourceName: 'walls', frameIndex: 37 },
    RQ: { resourceName: 'walls', frameIndex: 38 },
    RR: { resourceName: 'walls', frameIndex: 43 },
    RS: { resourceName: 'walls', frameIndex: 44 },
    RT: { resourceName: 'walls', frameIndex: 48 },
    RU: { resourceName: 'walls', frameIndex: 49 },
    RV: { resourceName: 'walls', frameIndex: 50 },
    RW: { resourceName: 'walls', frameIndex: 51 },
    '00': { resourceName: 'walls', frameIndex: 4 },
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
      resourceConfig,
    } = levelConfig;

    this.buildMap(resourceConfig);

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
        const tile = new Sprite({
          resource: resources.images[tilecfg.resourceName],
          frameColumns: fc?.frameConfig.columns,
          frameRows: fc?.frameConfig.rows,
          frameSize: Vector2.fromPoint(fc?.frameConfig.size),
          frameIndex: tilecfg.frameIndex,
          position: new Vector2(gridCells(x), gridCells(y)),
        });
        // console.info(
        //   `drawing index ${
        //     this.mapAddresses[y * columns + x]
        //   } at grid ${x}, ${y}`
        // );
        tile.drawLayer = 'GROUND';

        this.addChild(tile);
      }
    }
  }
}
