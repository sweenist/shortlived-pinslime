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
    R0: { resourceName: 'walls', frameIndex: 3 },
    R1: { resourceName: 'walls', frameIndex: 4 },
    W3: { resourceName: 'walls', frameIndex: 5 },
    W4: { resourceName: 'walls', frameIndex: 6 },
    W5: { resourceName: 'walls', frameIndex: 7 },
    R2: { resourceName: 'walls', frameIndex: 8 },
    R3: { resourceName: 'walls', frameIndex: 9 },
    W6: { resourceName: 'walls', frameIndex: 10 },
    W7: { resourceName: 'walls', frameIndex: 11 },
    W8: { resourceName: 'walls', frameIndex: 12 },
    '00': { resourceName: 'walls', frameIndex: 13 },
    '14': { resourceName: 'walls', frameIndex: 14 },
    '15': { resourceName: 'walls', frameIndex: 15 },
    '16': { resourceName: 'walls', frameIndex: 16 },
    '17': { resourceName: 'walls', frameIndex: 17 },
    '18': { resourceName: 'walls', frameIndex: 18 },
    '19': { resourceName: 'walls', frameIndex: 19 },
    '20': { resourceName: 'walls', frameIndex: 20 },
    '21': { resourceName: 'walls', frameIndex: 21 },
    '22': { resourceName: 'walls', frameIndex: 22 },
    '23': { resourceName: 'walls', frameIndex: 23 },
    '24': { resourceName: 'walls', frameIndex: 24 },
    '25': { resourceName: 'walls', frameIndex: 25 },
    '26': { resourceName: 'walls', frameIndex: 26 },
    '27': { resourceName: 'walls', frameIndex: 27 },
    '28': { resourceName: 'walls', frameIndex: 28 },
  };

  constructor(params: LevelParams) {
    super({ actorPosition: new Vector2(gridCells(3), gridCells(8)) });

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
