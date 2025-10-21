import { GameObject } from '../../gameEngine/GameObject';
import { Sprite, type SpriteParams } from '../../gameEngine/Sprite';
import type { DrawLayers } from '../../types';
import type { Vector2 } from '../../utils/vector';

export interface ObstacleParams {
  position?: Vector2;
  content: SpriteParams;
  isSolid?: boolean;
  drawLayer?: DrawLayers;
  deflection?: 1 | -1;
}

export default class Obstacle extends GameObject {
  isSolid: boolean = true;
  deflection?: 1 | -1;

  constructor(params: ObstacleParams) {
    super(params.position);

    this.isSolid = params.isSolid ?? true;
    this.drawLayer = params.drawLayer ?? 'DEFAULT';
    this.deflection = params.deflection;
    const texture = new Sprite(params.content);

    this.addChild(texture);
  }
}
