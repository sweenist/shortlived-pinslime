import { describe, expect, it } from 'vitest';
import {
  makeAnimationFrames,
  type frameConfiguration,
} from '@src/actors/heroAnimations';

describe('heroAnimations', () => {
  it('should create animation frames', () => {
    const target = makeAnimationFrames(1, 800);
    const expectedFrames: frameConfiguration[] = [
      { time: 0, frame: 2 },
      { time: 200, frame: 1 },
      { time: 400, frame: 2 },
      { time: 600, frame: 3 },
    ];

    expect(target.duration).toBe(800);
    expect(target.frames).toHaveLength(4);
    expect(target.frames).toMatchObject(expectedFrames);
  });
});
