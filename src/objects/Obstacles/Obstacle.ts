import { GameObject } from '../../gameEngine/GameObject';
import { Sprite, type SpriteParams } from '../../gameEngine/Sprite';
import type { Vector2 } from '../../utils/vector';

export interface ObstacleParams {
  position?: Vector2;
  content: SpriteParams;
  isSolid?: boolean;
  turns?: 'NONE' | 'CCW' | 'CW';
}

export default class Obstacle extends GameObject {
  isSolid: boolean = true;
  turns: 'NONE' | 'CCW' | 'CW' = 'NONE';

  constructor(params: ObstacleParams) {
    super(params.position);

    this.isSolid = params.isSolid ?? true;
    this.turns = params.turns ?? 'NONE';
    const texture = new Sprite(params.content);

    this.addChild(texture);
  }
}
