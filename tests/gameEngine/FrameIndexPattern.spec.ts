import { FrameIndexPattern } from "@src/gameEngine/animations/FrameIndexPattern";
import { describe, expect, it } from "vitest";

describe('FrameIndexPattern', () => {
  it('should return the active frame after initialization', () => {
    const target = new FrameIndexPattern({
      duration: 200,
      type: 'frame',
      frames: [
        { type: 'frame', frame: 1, time: 0 },
        { type: 'frame', frame: 2, time: 100 },
        { type: 'frame', frame: 3, time: 150 },
      ]
    });

    expect(target.frame).toBe(1);
  });

  it('should return the next frame after step passed frame time', () => {
    const target = new FrameIndexPattern({
      duration: 200,
      type: 'frame',
      frames: [
        { type: 'frame', frame: 1, time: 0 },
        { type: 'frame', frame: 2, time: 100 },
        { type: 'frame', frame: 3, time: 150 },
      ]
    });

    target.step(99);
    expect(target.frame).toBe(1);

    target.step(1);
    expect(target.frame).toBe(2);

    target.step(1);
    expect(target.frame).toBe(2);
    expect(target.currentTime).toBe(101);
  });


  it('should return the first frame after stepping over time threshold', () => {
    const target = new FrameIndexPattern({
      duration: 200,
      type: 'frame',
      frames: [
        { type: 'frame', frame: 1, time: 0 },
        { type: 'frame', frame: 2, time: 100 },
        { type: 'frame', frame: 3, time: 150 },
      ]
    });

    target.step(201);
    expect(target.frame).toBe(1);

    expect(target.currentTime).toBe(0);
  });


  it('should throw when current time is less than defined minimum threshold', () => {
    const target = new FrameIndexPattern({
      duration: 200,
      type: 'frame',
      frames: [
        { type: 'frame', frame: 1, time: 1 },
        { type: 'frame', frame: 2, time: 100 },
        { type: 'frame', frame: 3, time: 150 },
      ]
    });

    expect(() => target.frame).throws('Time is before keyframe')
  });
});