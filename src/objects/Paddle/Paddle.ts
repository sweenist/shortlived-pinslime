import { Animations } from "../../gameEngine/Animations";
import { GameObject } from "../../gameEngine/GameObject";
import type { Main } from "../../gameEngine/Main";
import { Sprite } from "../../gameEngine/Sprite";
import { resources } from "../../Resources";
import type { deflectionCoefficient, DirectionShift } from "../../types";
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

interface PaddleConfig {
  offset: Vector2;
  rest: animationConfiguration,
  flap: animationConfiguration,
  deflection: deflectionCoefficient
}

const paddleConfiguration: Record<keyof typeof DirectionShift, PaddleConfig> = {
  N_E: { offset: new Vector2(-3, 5), rest: N_E_PADDLE_REST, flap: N_E_PADDLE_FLAP, deflection: -1 },
  N_W: { offset: new Vector2(3, 5), rest: N_W_PADDLE_REST, flap: N_W_PADDLE_FLAP, deflection: -1 },
  E_N: { offset: new Vector2(-5, 3), rest: E_N_PADDLE_REST, flap: E_N_PADDLE_FLAP, deflection: -1 },
  E_S: { offset: new Vector2(-5, -3), rest: E_S_PADDLE_REST, flap: E_S_PADDLE_FLAP, deflection: -1 },
  W_N: { offset: new Vector2(5, -3), rest: W_N_PADDLE_REST, flap: W_N_PADDLE_FLAP, deflection: -1 },
  W_S: { offset: new Vector2(5, 3), rest: W_S_PADDLE_REST, flap: W_S_PADDLE_FLAP, deflection: -1 },
  S_E: { offset: new Vector2(-3, -5), rest: S_E_PADDLE_REST, flap: S_E_PADDLE_FLAP, deflection: -1 },
  S_W: { offset: new Vector2(3, -5), rest: S_W_PADDLE_REST, flap: S_W_PADDLE_FLAP, deflection: -1 },
}

export interface PaddleParams {
  position: Vector2;
  direction: keyof typeof DirectionShift;
}

export class Paddle extends GameObject {
  sprite: Sprite;
  deflection: deflectionCoefficient;
  isActivated: boolean = false
  activationTime: number = 0;

  constructor(params: PaddleParams) {
    super(params.position);

    const paddleConfig = paddleConfiguration[params.direction];
    this.name = `${params.direction}-${params.position}`;
    this.deflection = paddleConfig.deflection;

    this.sprite = new Sprite({
      resource: resources.images['paddles'],
      position: paddleConfig.offset,
      frameColumns: 4,
      frameRows: 4,
      frameSize: new Vector2(16, 16),
      animations: new Animations({
        rest: new FrameIndexPattern(paddleConfig.rest),
        flap: new FrameIndexPattern(paddleConfig.flap),
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

  step(deltaTime: number, root?: Main): void {
    const { state, input } = root!;

    if (this.isActivated) {
      this.activationTime -= deltaTime;
      if (this.activationTime <= 0) this.isActivated = false;
    }
    if (state.isPlaying)
      if (input.getActionJustPressed('Space')) {
        console.info(this.name, this.sprite.animations)
        this.isActivated = true
        this.activationTime = 120;
        this.sprite.animations?.playOnce('flap', () => {
          this.sprite.animations?.play('rest')
        });
      }

  }
}