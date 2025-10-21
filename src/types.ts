export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export const DirectionShift = {
  N_E: 'northToEast',
  N_W: 'northToWest',
  E_N: 'eastToNorth',
  E_S: 'eastToSouth',
  S_E: 'southToEast',
  S_W: 'southToWest',
  W_N: 'westToNorth',
  W_S: 'westToSouth'
} as const;

export type DirectionShiftType = typeof DirectionShift[keyof typeof DirectionShift];

export type DrawLayers = 'DEFAULT' | 'GROUND' | 'SKY' | 'USER_INTERFACE';

export type DialogueScenario = {
  message: string;
  requires?: string[];
  bypass?: string[];
  addFlag?: string;
  portraitFrame?: number;
};

export type fader = -1 | 1;
export type deflectionCoefficient = -1 | 1;
