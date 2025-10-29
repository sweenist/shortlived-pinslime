import type { animationConfiguration } from "../../types/animationTypes";
import { singleFrame } from "../../utils/animationBuilders";

const flap = (rootFrame: number, reverse: boolean = false): animationConfiguration => {
  return {
    duration: 150,
    type: 'frame',
    frames: [
      {
        frame: reverse ? rootFrame - 1 : rootFrame + 1,
        time: 0
      },
      {
        frame: reverse ? rootFrame - 2 : rootFrame + 2,
        time: 17
      },
      {
        frame: reverse ? rootFrame - 3 : rootFrame + 3,
        time: 33
      },
      {
        frame: reverse ? rootFrame - 2 : rootFrame + 2,
        time: 100
      },
      {
        frame: reverse ? rootFrame - 1 : rootFrame + 1,
        time: 150
      }
    ]
  }
}

export const N_E_PADDLE_REST: animationConfiguration = singleFrame(0);
export const N_W_PADDLE_REST: animationConfiguration = singleFrame(11);
export const E_N_PADDLE_REST: animationConfiguration = singleFrame(3);
export const E_S_PADDLE_REST: animationConfiguration = singleFrame(4);
export const W_N_PADDLE_REST: animationConfiguration = singleFrame(8);
export const W_S_PADDLE_REST: animationConfiguration = singleFrame(15);
export const S_E_PADDLE_REST: animationConfiguration = singleFrame(7);
export const S_W_PADDLE_REST: animationConfiguration = singleFrame(12);

export const N_E_PADDLE_FLAP: animationConfiguration = flap(0)
export const N_W_PADDLE_FLAP: animationConfiguration = flap(11, true);
export const E_N_PADDLE_FLAP: animationConfiguration = flap(3, true);
export const E_S_PADDLE_FLAP: animationConfiguration = flap(4);
export const W_N_PADDLE_FLAP: animationConfiguration = flap(8);
export const W_S_PADDLE_FLAP: animationConfiguration = flap(15, true);
export const S_E_PADDLE_FLAP: animationConfiguration = flap(7, true);
export const S_W_PADDLE_FLAP: animationConfiguration = flap(12);
