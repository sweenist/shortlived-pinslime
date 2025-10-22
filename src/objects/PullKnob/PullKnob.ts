import { STATE_LAUNCHING } from "../../constants";
import { Animations } from "../../gameEngine/Animations";
import { FrameIndexPattern } from "../../gameEngine/FrameIndexPattern";
import { GameObject } from "../../gameEngine/GameObject";
import type { Main } from "../../gameEngine/Main";
import { Sprite } from "../../gameEngine/Sprite";
import { resources } from "../../Resources";
import { Vector2 } from "../../utils/vector";
import { IDLE, LAUNCHING } from "./pullknobAnimations";

export class PullKnob extends GameObject {
  sprite: Sprite

  constructor(position: Vector2) {
    super(position);

    const offset = new Vector2(-48, 0);
    this.sprite = new Sprite({
      resource: resources.images['pullknob'],
      position: offset,
      frameColumns: 1,
      frameRows: 7,
      frameIndex: 0,
      frameSize: new Vector2(80, 16),
      animations: new Animations({
        idle: new FrameIndexPattern(IDLE),
        launching: new FrameIndexPattern(LAUNCHING),
      })
    });
    this.isSolid = true;

    this.addChild(this.sprite)
  }

  ready(): void {
    this.sprite.animations?.play('idle');
  }

  step(_deltaTime: number, root?: Main): void {
    const { state } = root!;
    if (state.current === STATE_LAUNCHING) {
      this.sprite.animations?.playOnce('launching', () => {
        this.sprite.animations?.play('idle');
      });
    }
  }
}