import { describe, expect, it } from 'vitest';
import { Vector2 } from '@src/utils/vector';

describe('Vector2', () => {
  it('should duplicate existing vector', () => {
    const source = new Vector2(42, 1080);
    const target = source.duplicate();

    expect(target.x).toBe(source.x);
    expect(target.y).toBe(source.y);
  });

  it('should display x and y properties when calling toString', () => {
    const vec = new Vector2(80, 98);
    const target = vec.toString();

    expect(target).toBe('x: 80, y: 98');
  });

  it('should add two vectors together', () => {
    const augend = new Vector2(33, 47);
    const addend = new Vector2(19, 100);

    const sum = augend.add(addend);

    expect(sum.x).toBe(52);
    expect(sum.y).toBe(147);
  });
});
