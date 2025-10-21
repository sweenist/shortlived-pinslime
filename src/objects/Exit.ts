import { signals } from '../events/eventConstants';
import { gameEvents } from '../events/Events';
import { GameObject } from '../gameEngine/GameObject';
import { Sprite } from '../gameEngine/Sprite';
import { resources } from '../Resources';
import { Vector2 } from '../utils/vector';

export class Exit extends GameObject {
  exitId: number = -1;

  constructor(x: number, y: number) {
    super(new Vector2(x, y));

    this.drawLayer = 'GROUND';

    this.addChild(new Sprite({ resource: resources.images.exit }));
  }

  ready(): void {
    this.exitId = gameEvents.on(
      signals.slimePosition,
      this,
      (value: Vector2) => {
        const heroPosition = value as Vector2;

        if (heroPosition.prettyClose(this.position)) {
          gameEvents.emit(signals.sceneExit, this.name);
          gameEvents.off(this.exitId!);
        }
      }
    );
  }
}
