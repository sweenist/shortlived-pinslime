import type { ItemEventMetaData } from '../../types/eventTypes';
import { gameEvents } from '../../events/Events';
import { GameObject } from '../../gameEngine/GameObject';
import { Sprite } from '../../gameEngine/Sprite';
import { resources } from '../../Resources';
import { Vector2 } from '../../utils/vector';
import { signals } from '../../events/eventConstants';
import type { Movement } from '../../types';
import type { Main } from '../../gameEngine/Main';

const RESPAWN: number = 3500 as const;

interface ItemParams {
  pointValue: number,
  position: Vector2,
  image: string,
}

export class Item extends GameObject {
  sprite: Sprite;
  pointValue: number;
  respawnCooldown: number = 0;

  constructor(params: ItemParams) {
    super(params.position);

    this.pointValue = params.pointValue;

    this.sprite = new Sprite({
      resource: resources.images[params.image],
      frameSize: new Vector2(16, 16)
    });

    this.addChild(this.sprite);
  }

  ready(): void {
    gameEvents.on<Movement>(signals.slimePosition, this, (value) => {
      const { position: actorPosition } = value;

      if (actorPosition.prettyClose(this.position)) {
        this.onPlayerCollide();
        this.setRespawn();
      }
    });
  }

  step(deltaTime: number, _root?: Main): void {
    if (this.respawnCooldown > 0) {
      this.respawnCooldown -= deltaTime;
      if (this.respawnCooldown <= 0) {
        this.addChild(this.sprite);
      }
    }
  }

  setRespawn() {
    this.removeChild(this.sprite);
    this.respawnCooldown = RESPAWN;
  }

  onPlayerCollide() {
    if (this.respawnCooldown > 0)
      gameEvents.emit<ItemEventMetaData>(signals.slimeItemCollect, {
        image: resources.images.rod,
        position: this.position,
        points: this.pointValue,
      });
  }
}
