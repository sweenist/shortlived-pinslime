import type { ShadowConfig } from "@src/actors/AfterImage";

const shadows = {
  umbra: { frameIndex: 0, position: { x: 0, y: 0 } },
  penumbra: {
    frameIndex: 0,
    position: {
      x: 0,
      y: 0
    }
  }
}
export const mockShadowConfig: ShadowConfig = { DOWN: shadows, UP: shadows, LEFT: shadows, RIGHT: shadows };