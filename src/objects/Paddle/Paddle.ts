import { GameObject } from "../../gameEngine/GameObject";
import { Sprite } from "../../gameEngine/Sprite";
import { resources } from "../../Resources";
import type { Direction } from "../../types";
import { Vector2 } from "../../utils/vector";

export interface PaddleParams {
  position: Vector2;
  offset: Vector2;
  initialFacing: Direction;
  terminalFacing: Direction;
}

export class Paddle extends GameObject {
  sprite: Sprite;

  constructor(params: PaddleParams) {
    super(params.position);

    this.sprite = new Sprite({
      resource: resources.images['paddles'],
      position: params.offset,
      frameColumns: 4,
      frameRows: 4,
      frameSize: new Vector2(16, 16)
    });
  }
}