import { Animations } from "../../gameEngine/Animations";
import { GameObject } from "../../gameEngine/GameObject";
import type { Main } from "../../gameEngine/Main";
import { Sprite } from "../../gameEngine/Sprite";
import { resources } from "../../Resources";
import type { DirectionShift } from "../../types";
import { Vector2 } from "../../utils/vector";
import {
  N_E_PADDLE_REST, N_W_PADDLE_REST, E_N_PADDLE_REST, E_S_PADDLE_REST,
  W_N_PADDLE_REST, W_S_PADDLE_REST, S_E_PADDLE_REST, S_W_PADDLE_REST,
  N_E_PADDLE_FLAP, N_W_PADDLE_FLAP, E_N_PADDLE_FLAP, E_S_PADDLE_FLAP,
  W_N_PADDLE_FLAP, W_S_PADDLE_FLAP, S_E_PADDLE_FLAP, S_W_PADDLE_FLAP
} from './paddleAnimations';
import { FrameIndexPattern } from '../../gameEngine/FrameIndexPattern';

const offsets: Record<keyof typeof DirectionShift, Vector2> = {
  N_E: new Vector2(0, -4),
  N_W: new Vector2(0, -4),
  S_E: new Vector2(0, 4),
  S_W: new Vector2(0, 4),
  E_N: new Vector2(-4, 0),
  E_S: new Vector2(-4, 0),
  W_N: new Vector2(4, 0),
  W_S: new Vector2(4, 0),
}

export interface PaddleParams {
  position: Vector2;
  direction: keyof typeof DirectionShift;
}

export const restPatterns: Record<keyof typeof DirectionShift, FrameIndexPattern> = {
  N_E: new FrameIndexPattern(N_E_PADDLE_REST),
  N_W: new FrameIndexPattern(N_W_PADDLE_REST),
  E_N: new FrameIndexPattern(E_N_PADDLE_REST),
  E_S: new FrameIndexPattern(E_S_PADDLE_REST),
  W_N: new FrameIndexPattern(W_N_PADDLE_REST),
  W_S: new FrameIndexPattern(W_S_PADDLE_REST),
  S_E: new FrameIndexPattern(S_E_PADDLE_REST),
  S_W: new FrameIndexPattern(S_W_PADDLE_REST),
};

export const flapPatterns: Record<keyof typeof DirectionShift, FrameIndexPattern> = {
  N_E: new FrameIndexPattern(N_E_PADDLE_FLAP),
  N_W: new FrameIndexPattern(N_W_PADDLE_FLAP),
  E_N: new FrameIndexPattern(E_N_PADDLE_FLAP),
  E_S: new FrameIndexPattern(E_S_PADDLE_FLAP),
  W_N: new FrameIndexPattern(W_N_PADDLE_FLAP),
  W_S: new FrameIndexPattern(W_S_PADDLE_FLAP),
  S_E: new FrameIndexPattern(S_E_PADDLE_FLAP),
  S_W: new FrameIndexPattern(S_W_PADDLE_FLAP),
};

export class Paddle extends GameObject {
  sprite: Sprite;

  constructor(params: PaddleParams) {
    super(params.position);

    this.sprite = new Sprite({
      resource: resources.images['paddles'],
      position: offsets[params.direction],
      frameColumns: 4,
      frameRows: 4,
      frameSize: new Vector2(16, 16),
      animations: new Animations({
        rest: restPatterns[params.direction],
        flap: flapPatterns[params.direction],
      })
    });
  }

  step(_deltaTime: number, _root?: Main): void {
    // this.sprite.animations?.play('rest');
  }
}