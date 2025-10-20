import type { animationConfiguration, frameConfiguration } from "../types/animationTypes";

export const makeAnimation = (rootFrame: number, duration: number, frameCount: number): animationConfiguration => {
  const frames: frameConfiguration[] = []
  const rate = duration / frameCount;
  let accumulatedTime = 0;
  const upperBound = rootFrame + frameCount;

  for (let i = rootFrame; i < upperBound; i++) {
    frames.push({
      time: accumulatedTime,
      frame: i
    })
    accumulatedTime += rate;
  }
  return { duration, frames }
}

export const singleFrame = (frame: number): animationConfiguration => {
  return {
    duration: 1,
    frames: [{
      frame,
      time: 0
    }]
  }
}