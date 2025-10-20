import type { animationConfiguration } from '../actors/heroAnimations';

export class FrameIndexPattern {
  animationConfiguration: animationConfiguration;
  duration: number;
  currentTime: number;

  constructor(animationConfiguration: animationConfiguration) {
    this.currentTime = 0;
    this.animationConfiguration = animationConfiguration;
    this.duration = animationConfiguration.duration;
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

  step(delta: number): boolean {
    this.currentTime += delta
    const wrapped = this.currentTime >= this.duration;
    if (wrapped) {
      this.currentTime = 0;
    }
    return wrapped;
  }
}