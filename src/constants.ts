import type { DrawLayers } from "./types";

export const backgroundColor = '#070e0f';
export const fadeIn = 1;
export const fadeOut = -1;

export const LEFT = 'LEFT';
export const RIGHT = 'RIGHT';
export const UP = 'UP';
export const DOWN = 'DOWN';

export const STATE_TITLE = 'title';
export const STATE_LOADING = 'titleExit';
export const STATE_INITIAL = 'initial';
export const STATE_LAUNCHING = 'launching';
export const STATE_PLAYING = 'playing';
export const STATE_EXPIRED = 'expired';
export const STATE_DEAD = 'dead';
export const STATE_GAMEOVER = 'gameover';
export const STATE_NAMES = ['title', 'titleExit', 'initial', 'launching', 'playing', 'expired', 'dead', 'gameover'] as const;

export const SOUNDS = [
  'selectDing',
  'confirmation',
  'fruitCollect1',
  'fruitCollect2',
  'fruitCollect3',
  'fruitCollect4',
  'fruitCollect5',
  'countDown',
  'paddle',
  'collisionDeath',
  'timeOutDeath',
  'titleMusic',
  'deathMusic',
  'levelMusic',
] as const;

export const LayerPriority: Record<DrawLayers, number> = {
      GROUND: 0,
      DEFAULT: 1,
      SKY: 2,
      USER_INTERFACE: 3,
    } as const;