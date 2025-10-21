import { describe, expect, it } from 'vitest';
import {
  makeMovementFrames
} from '@src/actors/slimeAnimations';
import type { frameConfiguration } from '@src/types/animationTypes';

describe('heroAnimations', () => {
  it('should create animation frames', () => {
    const target = makeMovementFrames(2);
    const expectedFrames: frameConfiguration[] = [
      { time: 0, frame: 2 },
      { time: 367, frame: 3 },
    ];

    expect(target.duration).toBe(900);
    expect(target.frames).toHaveLength(2);
    expect(target.frames).toMatchObject(expectedFrames);
  });
});
