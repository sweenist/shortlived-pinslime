import type { ItemEventMetaData } from '../../types/eventTypes';
import { gameEvents } from '../../events/Events';
import { GameObject } from '../../gameEngine/GameObject';
import { Sprite } from '../../gameEngine/Sprite';
import { resources } from '../../Resources';
import { Vector2 } from '../../utils/vector';
import { signals } from '../../events/eventConstants';

export class Rod extends GameObject {
  sprite: Sprite;
  constructor(x: number, y: number) {
    super(new Vector2(x, y));

    this.sprite = new Sprite({
      resource: resources.images['rod'],
      position: new Vector2(0, -4),
    });
    this.addChild(this.sprite);
  }

  ready(): void {
    gameEvents.on(signals.heroPosition, this, (value: Vector2) => {
      const heroPosition = value as Vector2;

      if (heroPosition.prettyClose(this.position)) {
        this.onPlayerCollide();
      }
    });
  }

  onPlayerCollide() {
    this.destroy();
    gameEvents.emit<ItemEventMetaData>(signals.heroItemCollect, {
      image: resources.images.rod,
      position: this.position,
    });
  }
}
