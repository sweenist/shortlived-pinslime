import type { ItemEventMetaData } from '../../types/eventTypes';
import { gameEvents } from '../../events/Events';
import { GameObject } from '../../gameEngine/GameObject';
import { Sprite } from '../../gameEngine/Sprite';
import { resources } from '../../Resources';
import { Vector2 } from '../../utils/vector';
import { signals } from '../../events/eventConstants';
import type { Movement } from '../../types';
import type { Main } from '../../gameEngine/Main';
import { Animations } from '../../gameEngine/Animations';
import { FrameIndexPattern } from '../../gameEngine/animations/FrameIndexPattern';
import { DEFAULT, RESPAWN } from './itemAnimations';

const RESPAWN_TIME: number = 4000 as const;

interface ItemParams {
  pointValue: number,
  position: Vector2,
  image: string,
}

export class Item extends GameObject {
  sprite: Sprite;
  pointValue: number;
  respawnCooldown: number = 0;
  imageName: string;

  constructor(params: ItemParams) {
    super(params.position);

    this.pointValue = params.pointValue;
    this.imageName = params.image;

    this.sprite = new Sprite({
      resource: resources.images[this.imageName],
      frameSize: new Vector2(16, 16),
      frameColumns: 2,
      frameRows: 3,
      animations: new Animations({
        default: new FrameIndexPattern(DEFAULT),
        respawn: new FrameIndexPattern(RESPAWN)
      }),
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
    this.sprite.animations?.play('default');
  }

  step(deltaTime: number, _root?: Main): void {
    if (this.respawnCooldown > 0) {
      this.respawnCooldown -= deltaTime;
      if (this.respawnCooldown <= 0) {
        this.sprite.animations?.play('default');
        this.respawnCooldown = 0;
      }
    }
  }

  setRespawn() {
    this.respawnCooldown = RESPAWN_TIME;
    this.sprite.animations?.play('respawn');
  }

  onPlayerCollide() {
    if (this.respawnCooldown == 0)
      gameEvents.emit<ItemEventMetaData>(signals.slimeItemCollect, {
        image: resources.images[this.imageName],
        position: this.position,
        points: this.pointValue,
      });
  }
}
