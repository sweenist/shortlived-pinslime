import type { animationConfiguration, offsetConfiguration } from "../../types/animationTypes";

export class OffsetIndexPattern {
  animationConfiguration: animationConfiguration & { type: 'offset' };
  duration: number;
  currentTime: number;
  isInTransition: boolean;

  constructor(animationConfiguration: animationConfiguration) {
    if (animationConfiguration.type !== 'offset') {
      throw new Error('OffsetIndexPattern requires an offset animation configuration');
    }
    this.currentTime = 0;
    this.animationConfiguration = animationConfiguration as animationConfiguration & { type: 'offset' };
    this.duration = animationConfiguration.duration;
    this.isInTransition = this.animationConfiguration.frames.some((frame) => frame.time === this.currentTime);
  }

  get frame() {
    const { frames } = this.animationConfiguration;
    for (let i = frames.length - 1; i >= 0; i--) {
      if (this.currentTime >= frames[i].time) {
        return frames[i].frame;
      }
    }
    throw `Time is before keyframe ${this.currentTime} < ${this.animationConfiguration.frames[0].time}`;
  }

  get offset() {
    const { frames: offsets } = this.animationConfiguration;
    return this.getOffsetMatchingTime(offsets)
  }

  step(delta: number): boolean {
    const { frames: offsets } = this.animationConfiguration;
    const previousFrame = this.getOffsetMatchingTime(offsets)
    this.currentTime += delta;
    const nextFrame = this.getOffsetMatchingTime(offsets);
    this.isInTransition = previousFrame !== nextFrame;
    if (this.isInTransition) console.info(`OffsetIndexPattern is in transition at time ${this.currentTime}`);

    const wrapped = this.currentTime >= this.duration;
    if (wrapped) {
      this.currentTime = 0;
    }
    return wrapped;
  }

  getOffsetMatchingTime(offsets: offsetConfiguration[]) {
    for (let i = offsets.length - 1; i >= 0; i--) {
      if (this.currentTime >= offsets[i].time) {
        return offsets[i].offset;
      }
    }
    throw `Offset is before keyframe ${this.currentTime} < ${this.animationConfiguration.frames[0].time}`;
  }
}