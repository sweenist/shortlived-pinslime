import { describe, expect, it } from 'vitest';
import { gridCells, isSpaceFree } from '@src/utils/grid';
import { Vector2 } from '@src/utils/vector';

describe('grid.ts', () => {
  describe('gridCells', () => {
    const testCases = [
      { n: 16, expected: 256 },
      { n: 0, expected: 0 },
      { n: -15, expected: -240 },
    ];
    it.each(testCases)('should return 16x number', ({ n, expected }) => {
      const target = gridCells(n);

      expect(target).toEqual(expected);
    });
  });

  describe('isSpaceFree', () => {
    const walls = new Set<string>();
    const targetVector = new Vector2(42, 0);
    walls.add(targetVector.toString());

    it('should be false if wall is encountered', () => {
      const result = isSpaceFree(walls, targetVector);

      expect(result).toBeFalsy();
    });

    it('should be true if wall is not encountered', () => {
      const result = isSpaceFree(walls, Vector2.Zero);

      expect(result).toBeTruthy();
    });
  });
});
