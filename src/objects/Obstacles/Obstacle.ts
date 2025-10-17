import { GameObject } from '../../gameEngine/GameObject';
import { Sprite, type SpriteParams } from '../../gameEngine/Sprite';
import type { Vector2 } from '../../utils/vector';

export interface ObstacleParams {
  position?: Vector2;
  content: SpriteParams;
  isSolid?: boolean;
}

export default class Obstacle extends GameObject {
  isSolid: boolean = true;

  constructor(params: ObstacleParams) {
    super(params.position);

    this.isSolid = params.isSolid ?? true;
    const texture = new Sprite(params.content);

    this.addChild(texture);
  }
}
