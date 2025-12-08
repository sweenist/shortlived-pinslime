import { Animations } from "../../gameEngine/Animations";
import { GameObject } from "../../gameEngine/GameObject";
import type { Main } from "../../gameEngine/Main";
import { Sprite } from "../../gameEngine/Sprite";
import { resources } from "../../Resources";
import type { Direction, DirectionShift } from "../../types";
import { spriteSize, Vector2 } from "../../utils/vector";
import {
  N_E_PADDLE_REST, N_W_PADDLE_REST, E_N_PADDLE_REST, E_S_PADDLE_REST,
  W_N_PADDLE_REST, W_S_PADDLE_REST, S_E_PADDLE_REST, S_W_PADDLE_REST,
  N_E_PADDLE_FLAP, N_W_PADDLE_FLAP, E_N_PADDLE_FLAP, E_S_PADDLE_FLAP,
  W_N_PADDLE_FLAP, W_S_PADDLE_FLAP, S_E_PADDLE_FLAP, S_W_PADDLE_FLAP
} from './paddleAnimations';
import { FrameIndexPattern } from '../../gameEngine/animations/FrameIndexPattern';
import type { animationConfiguration } from "../../types/animationTypes";
import { DOWN, LEFT, RIGHT, STATE_INITIAL, STATE_LAUNCHING, UP } from "../../constants";
import { gameEvents } from "../../events/Events";
import { signals } from "../../events/eventConstants";
import { gameState } from "../../game/GameState";

interface PaddleConfig {
  offset: Vector2;
  rest: animationConfiguration,
  flap: animationConfiguration,
  deflection: Direction,
}

const paddleConfiguration: Record<keyof typeof DirectionShift, PaddleConfig> = {
  N_E: { offset: new Vector2(-3, 2), rest: N_E_PADDLE_REST, flap: N_E_PADDLE_FLAP, deflection: RIGHT },
  N_W: { offset: new Vector2(3, 2), rest: N_W_PADDLE_REST, flap: N_W_PADDLE_FLAP, deflection: LEFT },
  E_N: { offset: new Vector2(-1, 3), rest: E_N_PADDLE_REST, flap: E_N_PADDLE_FLAP, deflection: UP },
  E_S: { offset: new Vector2(-1, -3), rest: E_S_PADDLE_REST, flap: E_S_PADDLE_FLAP, deflection: DOWN },
  W_N: { offset: new Vector2(1, 3), rest: W_N_PADDLE_REST, flap: W_N_PADDLE_FLAP, deflection: UP },
  W_S: { offset: new Vector2(1, -3), rest: W_S_PADDLE_REST, flap: W_S_PADDLE_FLAP, deflection: DOWN },
  S_E: { offset: new Vector2(-3, -2), rest: S_E_PADDLE_REST, flap: S_E_PADDLE_FLAP, deflection: RIGHT },
  S_W: { offset: new Vector2(3, -2), rest: S_W_PADDLE_REST, flap: S_W_PADDLE_FLAP, deflection: LEFT },
}

export interface PaddleParams {
  position: Vector2;
  direction: keyof typeof DirectionShift;
}

export class Paddle extends GameObject {
  sprite: Sprite;
  bottomRight: Vector2;
  deflection: Direction;
  isActivated: boolean = false;
  isTriggered: boolean = false;
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
      frameSize: spriteSize,
      animations: new Animations({
        rest: new FrameIndexPattern(paddleConfig.rest),
        flap: new FrameIndexPattern(paddleConfig.flap),
      })
    });

    this.addChild(this.sprite);
    this.bottomRight = this.position.add(spriteSize);
  }

  ready(): void {
    this.sprite.animations?.play('rest');

    gameEvents.on<void>(signals.gameAction, this, () => {
      this.isTriggered = true;
    });
  }

  step(deltaTime: number, root?: Main): void {
    const { input } = root!;

    if (this.isActivated) {
      this.activationTime -= deltaTime;
      if (this.activationTime <= 0) this.isActivated = false;
    }

    if (gameState.current === STATE_INITIAL || gameState.current === STATE_LAUNCHING || gameState.isPlaying)
      if (input.getActionJustPressed('Space') || this.isTriggered) {
        this.activate();
      }
    this.isTriggered = false;
  }

  activate() {
    this.isActivated = true
    this.activationTime = 300;
    this.sprite.animations?.playOnce('flap', () => {
      this.sprite.animations?.play('rest')
    });
  }
}