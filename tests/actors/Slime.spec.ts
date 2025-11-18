import { Slime } from '@src/actors/Slime';
import { RIGHT } from '@src/constants';
import { Vector2 } from '@src/utils/vector';
import { describe, expect, it } from 'vitest';

describe('Slime', () => {
  it('should be created with defaults', () => {
    const target = new Slime(new Vector2(24, 42), 4);

    expect(target.position).toStrictEqual(new Vector2(24, 42));
    expect(target.afterImage).toBeDefined();
    expect(target.body).toBeDefined();
    expect(target.facingDirection).toBe(RIGHT);
    expect(target.children).toHaveLength(1);
  });
});
