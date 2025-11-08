import type { animationConfiguration } from "../../types/animationTypes";

export const DEFAULT: animationConfiguration = {
  type: 'frame',
  duration: 1000,
  frames: [
    { frame: 0, time: 0 },
    { frame: 1, time: 250 },
    { frame: 2, time: 500 },
    { frame: 3, time: 750 },
  ]
};

export const RESPAWN: animationConfiguration = {
  type: 'frame',
  duration: 4000,
  frames: [
    { frame: 4, time: 0 },
    { frame: 0, time: 2500 },
    { frame: 4, time: 2750 },
    { frame: 0, time: 3000 },
    { frame: 4, time: 3250 },
    { frame: 0, time: 3500 },
    { frame: 4, time: 3750 },
  ]
}