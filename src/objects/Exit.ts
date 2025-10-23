import { signals } from '../events/eventConstants';
import { gameEvents } from '../events/Events';
import { GameObject } from '../gameEngine/GameObject';
import { Sprite } from '../gameEngine/Sprite';
import { resources } from '../Resources';
import type { Movement } from '../types';
import { Vector2 } from '../utils/vector';

export class Exit extends GameObject {
  exitId: number = -1;

  constructor(x: number, y: number) {
    super(new Vector2(x, y));

    this.drawLayer = 'GROUND';

    this.addChild(new Sprite({ resource: resources.images.exit }));
  }

  ready(): void {
    this.exitId = gameEvents.on<Movement>(
      signals.slimePosition,
      this,
      ({ position: actorPosition }) => {
        if (actorPosition.prettyClose(this.position)) {
          gameEvents.emit(signals.sceneExit, this.name);
          gameEvents.off(this.exitId!);
        }
      }
    );
  }
}
