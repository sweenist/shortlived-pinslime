import { STATE_DEAD, STATE_GAMEOVER, type STATE_NAMES } from "../constants";
import { signals } from "../events/eventConstants";
import { gameEvents } from "../events/Events";
import { GameObject } from "../gameEngine/GameObject";
import type { Main } from "../gameEngine/Main";

export class ScoreViewModel extends GameObject {
  score: number;
  highScore: number;
  timeRemaining: number;
  currentLevel: number;

  constructor(level: number) {
    super();

    this.currentLevel = level;
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.timeRemaining = 20000;
  }

  ready(): void {
    gameEvents.on<number>(signals.scoreUpdate, this, (value) => {
      this.score += value;
    })

    gameEvents.on<typeof STATE_NAMES[number]>(signals.stateChanged, this, (state) => {
      if (state === STATE_GAMEOVER) {
        if (this.score > this.highScore) {
          this.saveHighScore()
        }
      }
    });
  }

  step(deltaTime: number, root?: Main): void {
    const { state } = root!;
    if (state.isPlaying) {
      this.timeRemaining -= deltaTime;
      this.timeRemaining = Math.max(0, this.timeRemaining);
    }
  }

  private loadHighScore(): number {
    const cachedHighScore = window.localStorage.getItem(this.hiScoreKey);
    return cachedHighScore ? parseInt(cachedHighScore) : 0;
  }

  private saveHighScore(): void {
    window.localStorage.setItem(this.hiScoreKey, `${this.score}`)
  }

  get hiScoreKey(): string {
    return `shortlived-level${this.currentLevel}`
  }

  reset(level: number | null) {
    if (level !== null) {
      this.currentLevel = level;
    }
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.timeRemaining = 20000;
  }
}