import { Hero } from '../actors/Hero';
import { signals } from '../events/eventConstants';
import { gameEvents } from '../events/Events';
import { Level, type LevelParams } from '../gameEngine/Level';
import { Sprite } from '../gameEngine/Sprite';
import { Exit } from '../objects/Exit';
import Obstacle from '../objects/Obstacles/Obstacle';
import { Rod } from '../objects/Rod/Rod';
import { resources } from '../Resources';
import { gridCells } from '../utils/grid';
import { Vector2 } from '../utils/vector';
import { CaveLevel } from './CaveLevel';
import levelConfig from './config/overworld.config.json';

export class OutdoorLevel extends Level {
  constructor(params: LevelParams) {
    super(params, levelConfig);

    const { trees, rocks, resourceConfig } = levelConfig;

    this.background = new Sprite({
      resource: resources.images.sky,
      frameSize: new Vector2(360, 180),
    });

    const ground = new Sprite({
      resource: resources.images.ground,
      frameSize: new Vector2(360, 180),
    });

    this.layoutObstacles(resourceConfig, trees);
    this.layoutObstacles(resourceConfig, rocks);

    const treeTop = new Obstacle({
      position: new Vector2(gridCells(13), gridCells(3)),
      isSolid: false,
      content: {
        resource: resources.images['spritesheet'],
        frameSize: new Vector2(16, 16),
        frameColumns: 4,
        frameRows: 5,
        frameIndex: 12,
        position: Vector2.Zero(),
      },
    });

    const exit = new Exit(gridCells(6), gridCells(3));
    const hero = new Hero(this.actorPosition);
    const rod = new Rod(gridCells(12), gridCells(4));

    this.addChild(ground);
    this.addChild(treeTop);

    this.addChild(exit);
    this.addChild(hero);
    this.addChild(rod);
  }

  ready(): void {
    gameEvents.on(signals.sceneExit, this, () => {
      gameEvents.emit(
        signals.levelChanging,
        new CaveLevel({
          actorPosition: new Vector2(gridCells(3), gridCells(6)),
        })
      );
    });
  }
}
