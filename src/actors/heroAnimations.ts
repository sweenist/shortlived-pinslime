export type frameConfiguration = {
  time: number;
  frame: number;
};

export type animationConfiguration = {
  duration: number;
  frames: frameConfiguration[];
};

export const makeMovementFrames = (
  rootFrame: number,
): animationConfiguration => {
  return {
    duration: 900,
    frames: [
    {
      time: 0,
      frame: rootFrame,
    },
    {
      time: 367,
      frame: rootFrame + 1,
    }
  ]}};

export const MOVE_UP = makeMovementFrames(6);
export const MOVE_RIGHT = makeMovementFrames(8)
export const MOVE_DOWN = makeMovementFrames(10);
export const MOVE_LEFT = makeMovementFrames(12);

export const IDLE_START: animationConfiguration = {
  duration: 5000,
  frames: [
    {
      time: 0,
      frame: 0,
    },
    {
      time: 760,
      frame: 1,
    },
    {
      time: 860,
      frame: 4,
    },
    {
      time: 960,
      frame: 5,
    },
    {
      time: 1900,
      frame: 4,
    },
    {
      time: 2000,
      frame: 1,
    },
    {
      time: 2100,
      frame: 0,
    },
    {
      time: 3500,
      frame: 2,
    },
    {
      time: 3583,
      frame: 3,
    },
    {
      time: 3650,
      frame: 2,
    },
    {
      time: 3800,
      frame: 0,
    },
  ]};