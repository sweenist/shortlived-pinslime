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
import { gameEvents } from "../../events/Events";
import { signals } from "../../events/eventConstants";
import type { animationConfiguration } from "../../types/animationTypes";

const offsets: Record<keyof typeof DirectionShift, Vector2> = {
  N_E: new Vector2(0, 0),
  N_W: new Vector2(0, 0),
  S_E: new Vector2(5, -1),
  S_W: new Vector2(5, 1),
  E_N: new Vector2(-5, -1),
  E_S: new Vector2(-5, -1),
  W_N: new Vector2(0, 0),
  W_S: new Vector2(0, 0),
}

export const restPatterns: Record<keyof typeof DirectionShift, animationConfiguration> = {
  N_E: N_E_PADDLE_REST,
  N_W: N_W_PADDLE_REST,
  E_N: E_N_PADDLE_REST,
  E_S: E_S_PADDLE_REST,
  W_N: W_N_PADDLE_REST,
  W_S: W_S_PADDLE_REST,
  S_E: S_E_PADDLE_REST,
  S_W: S_W_PADDLE_REST,
};

export const flapPatterns: Record<keyof typeof DirectionShift, animationConfiguration> = {
  N_E: N_E_PADDLE_FLAP,
  N_W: N_W_PADDLE_FLAP,
  E_N: E_N_PADDLE_FLAP,
  E_S: E_S_PADDLE_FLAP,
  W_N: W_N_PADDLE_FLAP,
  W_S: W_S_PADDLE_FLAP,
  S_E: S_E_PADDLE_FLAP,
  S_W: S_W_PADDLE_FLAP,
};

export interface PaddleParams {
  position: Vector2;
  direction: keyof typeof DirectionShift;
}

export class Paddle extends GameObject {
  sprite: Sprite;

  constructor(params: PaddleParams) {
    super(params.position);
    this.name = `${params.direction}-${params.position}`
    this.drawLayer = 'SKY';

    this.sprite = new Sprite({
      resource: resources.images['paddles'],
      position: offsets[params.direction],
      frameColumns: 4,
      frameRows: 4,
      frameSize: new Vector2(16, 16),
      animations: new Animations({
        rest: new FrameIndexPattern(restPatterns[params.direction]),
        flap: new FrameIndexPattern(flapPatterns[params.direction]),
      })
    });

    this.addChild(this.sprite)
  }

  ready(): void {
    gameEvents.on(signals.slimePosition, this, (value: Vector2) => {
      if (value.prettyClose(this.position)) {
        console.info(`${this.name} is close to hero at ${value}`)
      }
    });
    this.sprite.animations?.play('rest');
  }

  step(_deltaTime: number, root?: Main): void {
    const { state, input } = root!;

    if (state.isPlaying)
      if (input.getActionJustPressed('Space')) {
        console.info(this.name, this.sprite.animations)
        this.sprite.animations?.playOnce('flap', () => {
          this.sprite.animations?.play('rest')
        });
      }
  }
}