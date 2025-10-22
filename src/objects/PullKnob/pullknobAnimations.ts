import type { animationConfiguration } from "../../types/animationTypes";

export const IDLE: animationConfiguration = {
  duration: 0,
  frames: [
    {
      time: 0,
      frame: 0
    }
  ]
}

export const LAUNCHING: animationConfiguration = {
  duration: 1125,
  frames: [
    {
      frame: 3,
      time: 0,
    },
    {
      frame: 1,
      time: 250,
    },
    {
      time: 375,
      frame: 2,
    },
    {
      time: 500,
      frame: 3
    },
    {
      time: 617,
      frame: 4
    },
    {
      time: 725,
      frame: 5,
    },
    {
      time: 875,
      frame: 6,
    },
    {
      time: 925,
      frame: 5
    },
    {
      time: 1050,
      frame: 4
    }
  ]
}