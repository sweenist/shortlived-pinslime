import type { animationConfiguration } from "../../types/animationTypes";
import { Vector2 } from "../../utils/vector";

export const IDLE: animationConfiguration = {
  duration: 0,
  type: 'frame',
  frames: [
    {
      time: 0,
      frame: 0
    }
  ]
}

export const LAUNCHING: animationConfiguration = {
  duration: 1125,
  type: 'frame',
  frames: [
    {
      frame: 3,
      time: 0
    },
    {
      frame: 1,
      time: 125
    },
    {
      time: 250,
      frame: 2
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
      frame: 5
    },
    {
      time: 820,
      frame: 6
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

export const KNOB_LAUNCHING: animationConfiguration = {
  duration: 1125,
  type: 'offset',
  frames: [
    {
      frame: 0,
      time: 0,
      offset: new Vector2(-4, 0)
    },
    {
      frame: 0,
      time: 125,
      offset: new Vector2(-5, 0)
    },
    {
      time: 250,
      frame: 0,
      offset: new Vector2(-7, 0)
    },
    {
      time: 750,
      frame: 0,
      offset: new Vector2(12, 0)
    },
    {
      time: 785,
      frame: 0,
      offset: new Vector2(6, 0)
    },
    {
      time: 800,
      frame: 0,
      offset: new Vector2(2, 0)
    },
    {
      time: 820,
      frame: 0,
      offset: new Vector2(3, 0)
    },
    {
      time: 850,
      frame: 0,
      offset: new Vector2(-3, 0)
    },
    {
      time: 940,
      frame: 0,
      offset: new Vector2(-2, 0)
    },
    {
      time: 1000,
      frame: 0,
      offset: new Vector2(-6, 0)
    }
  ]
}