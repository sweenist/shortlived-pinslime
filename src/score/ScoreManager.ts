import { STATE_DEAD, type STATE_NAMES } from "../constants";
import { signals } from "../events/eventConstants";
import { gameEvents } from "../events/Events";
import { GameState } from "../game/GameState";
import { GameObject } from "../gameEngine/GameObject";
import type { Main } from "../gameEngine/Main";

type ScoreManagerParams = {
  state: GameState;
  level: number;
}

export class ScoreManager extends GameObject {
  score: number;
  highScore: number;
  timeRemaining: number;
  currentLevel: number;

  constructor(params: ScoreManagerParams) {
    super();

    this.score = 0;
    this.highScore = this.getHiScore;
    this.timeRemaining = params.state.getPlayTime ?? 20000;
    this.currentLevel = params.level;
  }

  ready(): void {
    gameEvents.on<number>(signals.scoreUpdate, this, (value) => {
      this.score += value;
    })

    gameEvents.on<typeof STATE_NAMES[number]>(signals.stateChanged, this, (state) => {
      if (state === STATE_DEAD) {
        if (this.score > this.highScore) {
          window.localStorage.setItem(this.hiScoreKey, `${this.score}`)
        }
      }
    });
  }

  step(deltaTime: number, _root?: Main): void {
    this.timeRemaining -= deltaTime;
  }

  get getHiScore(): number {
    return window.localStorage.getItem(this.hiScoreKey) as unknown as number;
  }

  get hiScoreKey(): string {
    return `shortlived-level${this.currentLevel}`
  }
}