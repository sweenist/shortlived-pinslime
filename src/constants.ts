export const flags = {
  caveKnightTalkedA: 'CAVE_KNIGHT_TALKED_A',
  caveKnightTalkedB: 'CAVE_KNIGHT_TALKED_B',
};

export const fadeIn = 1;
export const fadeOut = -1;

export const LEFT = 'LEFT';
export const RIGHT = 'RIGHT';
export const UP = 'UP';
export const DOWN = 'DOWN';

export const STATE_INITIAL = 'initial';
export const STATE_LAUNCHING = 'launching';
export const STATE_PLAYING = 'playing';
export const STATE_EXPIRED = 'expired';
export const STATE_DEAD = 'dead';
export const STATE_GAMEOVER = 'gameover';
export const STATE_NAMES = ['initial', 'launching', 'playing', 'expired', 'dead', 'gameover'] as const;