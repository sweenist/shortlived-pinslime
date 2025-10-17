import { describe, it, expect } from 'vitest';
import { moveTowards } from '@src/utils/moveUtils';
import { Vector2 } from '@src/utils/vector';

describe("moveTowards", () => {
  it("moves actor directly to destination if within speed (distance < speed)", () => {
    const actor = new Vector2(0, 0);
    const destination = new Vector2(1, 1);
    const speed = 2;

    const distance = moveTowards(actor, destination, speed);

    expect(actor).toEqual(destination);
    expect(distance).toBeCloseTo(1.414);
  });

  it("moves actor towards destination by speed if distance >= speed", () => {
    const actor = new Vector2(0, 0);
    const destination = new Vector2(3, 4); //distance = 5
    const speed = 2;

    const distance = moveTowards(actor, destination, speed);

    const expectedDistance = 3; //Remaining distance should be 5 (distance) - 2 (speed) = 3
    expect(distance).toBeCloseTo(expectedDistance);
    expect(actor.x).toBeCloseTo(1.2);
    expect(actor.y).toBeCloseTo(1.6);

  });

  it("does not move if actor is already at destination", () => {
    const actor = new Vector2(5, 5);
    const destination = new Vector2(5, 5);
    const speed = 1;

    const distance = moveTowards(actor, destination, speed);

    expect(actor).toEqual(destination);
    expect(distance).toBe(0);
  });
});