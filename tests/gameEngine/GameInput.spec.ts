import { describe, it, expect, vi } from 'vitest';
import { GameInput } from '@src/gameEngine/GameInput';
import { UP, DOWN, LEFT, RIGHT } from '@src/constants';

describe('gameInput', () => {
  const testCases = [
    { key: 'ArrowUp', expectedDirection: UP },
    { key: 'w', expectedDirection: UP },
    { key: 'ArrowDown', expectedDirection: DOWN },
    { key: 's', expectedDirection: DOWN },
    { key: 'ArrowLeft', expectedDirection: LEFT },
    { key: 'a', expectedDirection: LEFT },
    { key: 'ArrowRight', expectedDirection: RIGHT },
    { key: 'd', expectedDirection: RIGHT },
  ];
  it.each(testCases)(
    'should have direction $expectedDirection when $key is pressed',
    ({ key, expectedDirection }) => {
      const input = new GameInput();

      const event = new KeyboardEvent('keydown', { key });
      document.dispatchEvent(event);

      expect(document).toBeDefined();
      expect(input.direction).toBe(expectedDirection);
    }
  );

  it.each(testCases)(
    'should remove $expectedDirection when releasing $key',
    ({ key, expectedDirection }) => {
      const input = new GameInput();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));

      expect(input.directions.length).toBe(4);

      const event = new KeyboardEvent('keyup', { key });
      document.dispatchEvent(event);

      expect(input.directions).not.toContain(expectedDirection);
    }
  );

  it('should display a debug message when space is pressed', () => {
    const target = new GameInput();
    target.debugMessage = 'test message';

    const debugSpy = vi.spyOn(target, 'printDebug');
    const consoleSpy = vi.spyOn(console, 'debug');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'D' }));

    expect(debugSpy).toHaveBeenCalledOnce();
    expect(consoleSpy).toHaveBeenCalledWith(target.debugMessage);
  });
});
