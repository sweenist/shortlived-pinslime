import { signals } from "../events/eventConstants";
import { gameEvents } from "../events/Events";
import { GameObject } from "../gameEngine/GameObject";
import type { Main } from "../gameEngine/Main";

export class ScorePane extends GameObject {
  score: number;
  highScore: number;
  timeRemaining: number;

  constructor() {
    super();

    this.score = 0;
    this.highScore = 0;
    this.timeRemaining = 20000;
  }

  ready(): void {
    gameEvents.on<number>(signals.scoreUpdate, this, (value) => {
      this.score += value;
    })
  }

  step(deltaTime: number, _root?: Main): void {
    this.timeRemaining -= deltaTime;
  }
}