import type { SOUNDS, STATE_NAMES } from "./constants";
import type { Vector2 } from "./utils/vector";

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

export type OptionActions = {
  text: string,
  action: () => void,
};

export type OptionMenuParams = {
  divId: string;
  canvasId: string;
  options: OptionActions[];
};

export type fader = -1 | 1;
export type deflectionCoefficient = -1 | 1;

export type Movement = { position: Vector2, direction: Direction };

export type point = { x: number, y: number };


export type TileConfig = {
  resourceName: string;
  frameIndex: number;
  deflection?: number;
  approaches?: string[];
  isSolid?: boolean;
};

export type MapConfig = {
  data: number[];
  width: number;
  height: number;
};

export type ItemConfig = {
  location: point,
  image: string,
};

export type PaddleLocations = Partial<Record<keyof typeof DirectionShift, Array<point>>>;
export type SOUND_NAMES = typeof SOUNDS[number];
export type GameStateType = typeof STATE_NAMES[number];
