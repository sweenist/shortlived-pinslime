export type frameConfiguration = {
  time: number;
  frame: number;
};

export type animationConfiguration = {
  duration: number;
  frames: frameConfiguration[];
};

export const makeAnimationFrames = (
  rootFrame: number,
  duration: number = 400
): animationConfiguration => {
  return {
    duration,
    frames: [
      {
        time: 0,
        frame: rootFrame + 1,
      },
      {
        time: duration / 4,
        frame: rootFrame,
      },
      {
        time: duration / 2,
        frame: rootFrame + 1,
      },
      {
        time: (duration / 4) * 3,
        frame: rootFrame + 2,
      },
    ],
  };
};

export const makeStandingFrames = (
  rootFrame: number,
  duration: number = 400
): animationConfiguration => {
  return {
    duration,
    frames: [
      {
        time: 0,
        frame: rootFrame + 1,
      },
    ],
  };
};

export const STAND_DOWN: animationConfiguration = makeStandingFrames(0);
export const STAND_RIGHT: animationConfiguration = makeStandingFrames(3);
export const STAND_UP: animationConfiguration = makeStandingFrames(6);
export const STAND_LEFT: animationConfiguration = makeStandingFrames(9);

export const WALK_DOWN: animationConfiguration = makeAnimationFrames(0);
export const WALK_RIGHT: animationConfiguration = makeAnimationFrames(3);
export const WALK_UP: animationConfiguration = makeAnimationFrames(6);
export const WALK_LEFT: animationConfiguration = makeAnimationFrames(9);

export const PICK_UP_DOWN: animationConfiguration = {
  duration: 400,
  frames: [{ frame: 12, time: 0 }],
};
