export type frameConfiguration = {
  time: number;
  frame: number;
};

export type animationConfiguration = {
  duration: number;
  frames: frameConfiguration[];
};