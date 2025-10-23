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
      time: 125,
    },
    {
      time: 250,
      frame: 2,
    },
    {
      time: 750,
      frame: 3
    },
    {
      time: 785,
      frame: 4
    },
    {
      time: 800,
      frame: 5,
    },
    {
      time: 820,
      frame: 6,
    },
    {
      time: 850,
      frame: 5
    },
    {
      time: 940,
      frame: 4
    },
    {
      time: 1000,
      frame: 3
    }
  ]
}