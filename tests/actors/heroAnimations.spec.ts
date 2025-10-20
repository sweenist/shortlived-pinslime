import { describe, expect, it } from 'vitest';
import {
  makeMovementFrames
} from '@src/actors/heroAnimations';
import type { frameConfiguration } from '@src/types/animationTypes';

describe('heroAnimations', () => {
  it('should create animation frames', () => {
    const target = makeMovementFrames(1);
    const expectedFrames: frameConfiguration[] = [
      { time: 0, frame: 2 },
      { time: 367, frame: 3 },
    ];

    expect(target.duration).toBe(800);
    expect(target.frames).toHaveLength(4);
    expect(target.frames).toMatchObject(expectedFrames);
  });
});
