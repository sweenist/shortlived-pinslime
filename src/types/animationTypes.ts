import type { Vector2 } from "../utils/vector";

export type frameConfiguration = {
  time: number;
  frame: number;
};

export type offsetConfiguration = {
  time: number;
  frame: number;
  offset: Vector2;
};

export type animationConfiguration = {
  duration: number;
  frames: frameConfiguration[];
  type: 'frame';
} | {
  duration: number;
  frames: offsetConfiguration[];
  type: 'offset';
};