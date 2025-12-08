import { STATE_TITLE } from "../../constants";
import { gameState } from "../../game/GameState";
import { Animations } from "../../gameEngine/Animations";
import { FrameIndexPattern } from "../../gameEngine/animations/FrameIndexPattern";
import { GameObject } from "../../gameEngine/GameObject";
import type { Main } from "../../gameEngine/Main";
import { Sprite } from "../../gameEngine/Sprite";
import { resources } from "../../Resources";
import { spriteSize, Vector2 } from "../../utils/vector";
import { COUNTDOWN } from "./stopwatchAnimations";

export class Stopwatch extends GameObject {
  sprite: Sprite;

  constructor(params: { position: Vector2 }) {
    super(params.position);

    this.sprite = new Sprite({
      resource: resources.images['stopwatch'],
      position: Vector2.Zero(),
      frameRows: 4,
      frameColumns: 4,
      frameSize: spriteSize,
      animations: new Animations({ countdown: new FrameIndexPattern(COUNTDOWN) })
    });

    this.addChild(this.sprite)
    this.sprite.animations?.playOnce('countdown', () => {
      this.removeChild(this.sprite);
    });
  }

  step(_deltaTime: number, _root?: Main): void {
    if (gameState.current === STATE_TITLE) {
      gameState.next();
    }
  }
}