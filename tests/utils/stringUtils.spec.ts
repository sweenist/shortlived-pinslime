import { toTitleCase } from '@src/utils/stringUtils'
import { describe, expect, it } from 'vitest'

describe('stringUtils', () => {
  describe('toTitleCase', () => {
    it.each([
      { key: "WORD", expected: "Word" },
      { key: "string", expected: "String" },
      { key: "cAMELcASE", expected: "Camelcase" }
    ])('should return a string starting with capital and rest lower', ({ key, expected }) => {
      const target = toTitleCase(key);

      expect(target).toBe(expected);
    })
  })
})