import { STATE_LAUNCHING } from "../../constants";
import { gameState } from "../../game/GameState";
import { Animations } from "../../gameEngine/Animations";
import { FrameIndexPattern } from "../../gameEngine/animations/FrameIndexPattern";
import { OffsetIndexPattern } from "../../gameEngine/animations/OffsetIndexPattern";
import { GameObject } from "../../gameEngine/GameObject";
import type { Main } from "../../gameEngine/Main";
import { Sprite } from "../../gameEngine/Sprite";
import { resources } from "../../Resources";
import { Vector2 } from "../../utils/vector";
import { IDLE, KNOB_LAUNCHING, LAUNCHING } from "./pullknobAnimations";

export class PullKnob extends GameObject {
  pin: Sprite;
  knob: Sprite;

  constructor(position: Vector2) {
    super(position);

    const pinOffset = new Vector2(-52, 0);
    this.pin = new Sprite({
      resource: resources.images['pullPin'],
      position: pinOffset,
      frameColumns: 1,
      frameRows: 7,
      frameIndex: 0,
      frameSize: new Vector2(80, 16),
      alwaysDraw: true,
      name: 'pullknob_Pin',
      animations: new Animations({
        idle: new FrameIndexPattern(IDLE),
        launching: new FrameIndexPattern(LAUNCHING),
      })
    });

    const knobOffset = new Vector2(-48, -8)
    this.knob = new Sprite({
      resource: resources.images['pullKnob'],
      position: knobOffset,
      frameIndex: 0,
      frameSize: new Vector2(16, 32),
      alwaysDraw: true,
      name: 'pullknob_Knob',
      animations: new Animations({
        idle: new FrameIndexPattern(IDLE),
        launching: new OffsetIndexPattern(KNOB_LAUNCHING),
      })
    });

    this.isSolid = true;

    this.addChild(this.pin)
    this.addChild(this.knob);
  }

  ready(): void {
    this.pin.animations?.play('idle');
  }

  step(_deltaTime: number, _root?: Main): void {
    if (gameState.current === STATE_LAUNCHING) {
      this.pin.animations?.playOnce('launching', () => {
        this.pin.animations?.play('idle');
      });
      this.knob.animations?.playOnce('launching', () => {
        this.knob.animations?.play('idle');
      })
    }
  }
}