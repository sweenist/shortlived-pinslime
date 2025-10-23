import { STATE_DEAD, STATE_EXPIRED, STATE_NAMES, STATE_PLAYING } from "../constants";
import { signals } from "../events/eventConstants";
import { gameEvents } from "../events/Events";

export class GameState {
  private _index: number;
  private _states: { [key: string]: number } = {
    initial: 3000,
    launching: 1000,
    playing: 20000,
    expired: 1500,
    dead: 1700,
    gameover: 65535,
  };
  private readonly _stateNames = STATE_NAMES
  constructor() {
    this._index = 0;
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

  public get current(): string {
    return this._stateNames[this._index];
  }

  step(deltaTime: number) {
    this._states[this.current] -= deltaTime;
    if (this._states[this.current] <= 0) {
      this._index++;
      gameEvents.emit(signals.stateChanged, this.current);
    }
  }

  getStepTime(): number {
    return this._states[this.current]
  }

  kill() {
    this._index = 4;
    gameEvents.emit(signals.stateChanged, STATE_DEAD);
  }

  next() {
    this._index++;
  }

  debug(): number {
    return this._states[this.current]
  }
}