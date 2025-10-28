import type { FrameIndexPattern } from './FrameIndexPattern';

export class Animations {
  patterns: { [key: string]: FrameIndexPattern }
  activeKey: string;
  private playOnceCallback?: () => void;

  constructor(patterns: { [key: string]: FrameIndexPattern }) {
    this.patterns = patterns;
    this.activeKey = Object.keys(this.patterns)[0];
  }

  get frame() {
    return this.patterns[this.activeKey].frame;
  }

  get offset() {
    return this.patterns[this.activeKey].offset;
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