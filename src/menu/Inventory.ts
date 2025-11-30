import { Vector2 } from '../utils/vector';
import { GameObject } from '../gameEngine/GameObject';
import { Sprite } from '../gameEngine/Sprite';
import { resources, type ImageResource } from '../Resources';
import { gameEvents } from '../events/Events';
import { signals } from '../events/eventConstants';

type InventoryItem = {
  id: number;
  image: ImageResource;
};

export class Inventory extends GameObject {
  nextId: number = 0;
  items: InventoryItem[] = [];

  constructor() {
    super(new Vector2(0, 1));

    this.drawLayer = 'USER_INTERFACE';

    this.items.push({ id: -1, image: resources.images.rod });
    this.items.push({ id: -2, image: resources.images.rod });

    this.renderInventory();
  }

  ready(): void {
    gameEvents.on(signals.slimeItemCollect, this, () => {
      this.nextId += 1;
      this.items.push({
        id: this.nextId,
        image: resources.images.rod,
      });
      this.renderInventory();
    });
  }

  renderInventory() {
    this.children.forEach((child) => child.destroy());

    this.items.forEach((item, i) => {
      const sprite = new Sprite({
        resource: item.image,
        position: new Vector2(i * 12, 0),
      });
      this.addChild(sprite);
    });
  }

  removeFromInventory(id: number) {
    this.items = this.items.filter((item) => item.id === id);
    this.renderInventory();
  }
}
