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
import mapContent from './config/overworld.txt?raw';
import levelConfig from './config/custom.config.json';

type tempType = {
  resourceName: string;
  frameIndex: number;
};

export class Pinball extends Level {
  mapAddresses: string[] = [];
  fancyMap: { [key: string]: tempType } = {
    D1: { resourceName: 'custom2', frameIndex: 0 },
    DN: { resourceName: 'custom2', frameIndex: 1 },
    D2: { resourceName: 'custom2', frameIndex: 2 },
    DX: { resourceName: 'custom2', frameIndex: 3 },
    G1: { resourceName: 'custom2', frameIndex: 4 },
    DW: { resourceName: 'custom2', frameIndex: 5 },
    DC: { resourceName: 'custom2', frameIndex: 6 },
    DE: { resourceName: 'custom2', frameIndex: 7 },
    G0: { resourceName: 'custom2', frameIndex: 8 },
    G2: { resourceName: 'custom2', frameIndex: 9 },
    D3: { resourceName: 'custom2', frameIndex: 10 },
    DS: { resourceName: 'custom2', frameIndex: 11 },
    D4: { resourceName: 'custom2', frameIndex: 12 },
    GR: { resourceName: 'custom2', frameIndex: 13 },
    G3: { resourceName: 'custom2', frameIndex: 14 },
    B1: { resourceName: 'custom2', frameIndex: 15 },
    B2: { resourceName: 'custom2', frameIndex: 16 },
    B5: { resourceName: 'custom2', frameIndex: 17 },
    B6: { resourceName: 'custom2', frameIndex: 18 },
    GD: { resourceName: 'custom2', frameIndex: 19 },
    B3: { resourceName: 'custom2', frameIndex: 20 },
    B4: { resourceName: 'custom2', frameIndex: 21 },
    B7: { resourceName: 'custom2', frameIndex: 22 },
    B8: { resourceName: 'custom2', frameIndex: 23 },
    '12': { resourceName: 'customOverworld', frameIndex: 12 },
    '13': { resourceName: 'customOverworld', frameIndex: 13 },
    '14': { resourceName: 'customOverworld', frameIndex: 14 },
    W1: { resourceName: 'custom3', frameIndex: 0 },
    WN: { resourceName: 'custom3', frameIndex: 1 },
    W2: { resourceName: 'custom3', frameIndex: 2 },
    RV: { resourceName: 'custom3', frameIndex: 3 },
    RH: { resourceName: 'custom3', frameIndex: 4 },
    WW: { resourceName: 'custom3', frameIndex: 5 },
    WC: { resourceName: 'custom3', frameIndex: 6 },
    WE: { resourceName: 'custom3', frameIndex: 7 },
    W5: { resourceName: 'custom3', frameIndex: 8 },
    W6: { resourceName: 'custom3', frameIndex: 9 },
    W3: { resourceName: 'custom3', frameIndex: 10 },
    WS: { resourceName: 'custom3', frameIndex: 11 },
    W4: { resourceName: 'custom3', frameIndex: 12 },
  };

  constructor(params: LevelParams) {
    super({ actorPosition: new Vector2(gridCells(3), gridCells(8)) });

    const {
      treeA,
      treeB,
      treeC,
      treeD,
      rockA,
      rockB,
      rockC,
      rockD,
      resourceConfig,
    } = levelConfig;

    this.buildMap(resourceConfig);

    this.layoutObstacles(resourceConfig, treeA);
    this.layoutObstacles(resourceConfig, treeB);
    this.layoutObstacles(resourceConfig, treeC);
    this.layoutObstacles(resourceConfig, treeD);

    this.layoutObstacles(resourceConfig, rockA);
    this.layoutObstacles(resourceConfig, rockB);
    this.layoutObstacles(resourceConfig, rockC);
    this.layoutObstacles(resourceConfig, rockD);

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
        console.info(
          `drawing index ${
            this.mapAddresses[y * columns + x]
          } at grid ${x}, ${y}`
        );
        tile.drawLayer = 'GROUND';

        this.addChild(tile);
      }
    }
  }
}
