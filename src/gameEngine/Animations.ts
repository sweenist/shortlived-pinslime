import { FrameIndexPattern } from './animations/FrameIndexPattern';
import { OffsetIndexPattern } from './animations/OffsetIndexPattern';

export class Animations {
  patterns: { [key: string]: FrameIndexPattern | OffsetIndexPattern }
  activeKey: string;
  private playOnceCallback?: () => void;

  constructor(patterns: { [key: string]: FrameIndexPattern | OffsetIndexPattern }) {
    this.patterns = patterns;
    this.activeKey = Object.keys(this.patterns)[0];
  }

  get currentPattern() {
    return this.patterns[this.activeKey];
  }

  get frame() {
    const pattern = this.currentPattern;
    if (pattern instanceof FrameIndexPattern) {
      return pattern.frame;
    }
    throw new Error(`Current pattern ${this.activeKey} does not support frame animation`);
  }

  get offset() {
    const pattern = this.currentPattern;
    if (pattern instanceof OffsetIndexPattern) {
      return pattern.offset;
    }
    throw new Error(`Current pattern ${this.activeKey} does not support offset animation`);
  }

  play(key: string, startAtTime: number = 0) {
    if (key === this.activeKey) return;

    this.activeKey = key;
    this.patterns[this.activeKey].currentTime = startAtTime;
  }

  playOnce(key: string, onComplete?: () => void, startAtTime: number = 0) {
    if (key === this.activeKey) {
      if (this.playOnceCallback) return;
      this.playOnceCallback = onComplete;
      return;
    }

    this.activeKey = key;
    this.patterns[this.activeKey].currentTime = startAtTime;
    this.playOnceCallback = onComplete;
  }

  step(deltaTime: number) {
    const wrapped = this.patterns[this.activeKey].step(deltaTime);
    if (wrapped && this.playOnceCallback) {
      const cb = this.playOnceCallback;
      this.playOnceCallback = undefined;
      cb();
    }
  }
}