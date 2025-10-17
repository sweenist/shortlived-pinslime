export class GameLoop {
  update: (timeStep: number) => void;
  render: () => void;
  rafId: number = 0;
  timeStep: number = 1000 / 60;
  lastFrameTime: number = 0;
  accumulatedTime: number = 0;
  isRunning: boolean = false;

  constructor(update: (timeStep: number) => void, render: () => void) {
    this.update = update;
    this.render = render;

    this.lastFrameTime = 0;
    this.accumulatedTime = 0;
  }

  mainloop = (timestamp: number) => {
    if (!this.isRunning) return;

    let deltaTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    this.accumulatedTime += deltaTime;

    while (this.accumulatedTime >= this.timeStep) {
      this.update(this.timeStep);
      this.accumulatedTime -= this.timeStep;
    }

    this.render();
    this.rafId = requestAnimationFrame(this.mainloop);
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.rafId = requestAnimationFrame(this.mainloop);
    }
  }

  stop() {
    if (this.isRunning) {
      this.isRunning = false;
      cancelAnimationFrame(this.rafId);
    }
  }
}