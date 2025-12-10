import { STATE_DEAD, STATE_EXPIRED, STATE_NAMES, STATE_PLAYING } from "../constants";
import { signals } from "../events/eventConstants";
import { gameEvents } from "../events/Events";

export class GameState {
  private _index: number;
  private readonly _stateDurations: { [key: string]: number | null } = {
    title: null,
    titleExit: 1250,
    initial: 3000,
    launching: 1000,
    playing: 20000,
    expired: 1500,
    dead: 1700,
    gameover: 65535,
  };

  private _remaining: number | null;
  private readonly _stateNames = STATE_NAMES;

  constructor() {
    this._index = 0;
    this._remaining = this._stateDurations[this.current] ?? null;
  }

  public get isExpired(): boolean {
    return this.current === STATE_EXPIRED;
  }

  public get isDead(): boolean {
    return this.current === STATE_DEAD;
  }

  public get isPlaying(): boolean {
    return this.current === STATE_PLAYING;
  }

  public get getPlayTime(): number | null {
    if (this.isPlaying)
      return this._remaining;

    return this._index < STATE_NAMES.findIndex((s) => s === STATE_PLAYING)
      ? this._stateDurations[STATE_PLAYING]
      : null;
  }

  public get current(): string {
    return this._stateNames[this._index];
  }

  private enterIndex(index: number) {
    this._index = index;
    this._remaining = this._stateDurations[this.current] ?? null;
    gameEvents.emit(signals.stateChanged, this.current);
  }

  step(deltaTime: number) {
    if (this._remaining === null) return;

    this._remaining -= deltaTime;
    if (this._remaining! <= 0) {
      const nextIndex = this._index + 1;
      if (nextIndex < this._stateNames.length) {
        this.enterIndex(nextIndex);
      } else {
        this._remaining = null;
      }
    }
  }

  getStepTime(): number {
    return this._remaining ?? 0;
  }

  set(state: string) {
    const index = STATE_NAMES.findIndex((s) => s === state);
    if (index > -1 && index !== this._index) {
      this.enterIndex(index);
    }
  }

  kill() {
    const deadIndex = STATE_NAMES.findIndex((s) => s === STATE_DEAD);
    if (deadIndex > -1) {
      this.enterIndex(deadIndex);
    } else {
      throw ("Couldn't find death index");
    }
  }

  next() {
    const nextIndex = this._index + 1;
    if (nextIndex < this._stateNames.length) {
      this.enterIndex(nextIndex);
    } else {
      console.warn("No next state available");
    }
  }

  debug(): number | null {
    return this._remaining;
  }
}

export const gameState = new GameState();