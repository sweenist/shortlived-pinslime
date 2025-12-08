import { STATE_DEAD, STATE_EXPIRED, STATE_GAMEOVER, STATE_INITIAL, STATE_LAUNCHING, STATE_LOADING, STATE_TITLE } from "../constants";
import { signals, soundTriggers } from "../events/eventConstants";
import { gameEvents } from "../events/Events";
import { GameObject } from "../gameEngine/GameObject";
import type { Main } from "../gameEngine/Main";
import { type SoundResource } from "../Resources";
import type { GameStateType, SOUND_NAMES } from "../types";
import { SoundPlayer } from "./SoundPlayer";

export class SoundManager extends GameObject {
  soundPlayer: SoundPlayer;
  fruitCount: number = 0;
  fruitCountUp: boolean = true;
  currentTrack: SoundResource | null = null;

  constructor() {
    super();

    this.soundPlayer = new SoundPlayer();
  }

  ready(): void {
    this.currentTrack = this.soundPlayer.playMusic('titleMusic', false);

    gameEvents.on(signals.toggleMusic, this, () => {
      this.soundPlayer.musicEnabled = !this.soundPlayer.musicEnabled;
      if (this.currentTrack)
        this.currentTrack.sound.volume = this.soundPlayer.musicEnabled
          ? this.currentTrack?.defaultVolume
          : 0;
    });

    gameEvents.on(signals.toggleSound, this, () => {
      this.soundPlayer.soundEffectsEnabled = !this.soundPlayer.soundEffectsEnabled;
    })

    gameEvents.on(soundTriggers.playMoveCursor, this, () => {
      this.soundPlayer.play('selectDing');
    });

    gameEvents.on(soundTriggers.playFruit, this, () => {
      this.adjustFruit();
      this.soundPlayer.play(`fruitCollect${this.fruitCount}` as unknown as SOUND_NAMES);
    });

    gameEvents.on(soundTriggers.playPaddle, this, () => {
      this.soundPlayer.play('paddle');
    })

    gameEvents.on<GameStateType>(signals.stateChanged, this, (value) => {
      if (value === STATE_TITLE) {
        this.soundPlayer.stop(this.currentTrack?.sound);
        this.currentTrack = this.soundPlayer.playMusic('titleMusic', false);
      }
      else if (value === STATE_LOADING) {
        if (this.currentTrack)
          this.soundPlayer.fadeOut(this.currentTrack?.sound);
        this.soundPlayer.play('confirmation')
      }
      else if (value === STATE_INITIAL)
        this.soundPlayer.play('countDown');
      else if (value === STATE_LAUNCHING) {
        this.currentTrack = this.soundPlayer.playMusic('levelMusic', false);
      }
      else if (value === STATE_DEAD) {
        this.soundPlayer.stop(this.currentTrack?.sound);
        this.soundPlayer.play('collisionDeath');
      }
      else if (value === STATE_EXPIRED) {
        this.soundPlayer.stop(this.currentTrack?.sound);
        this.soundPlayer.play('timeOutDeath');
      }
      else if (value === STATE_GAMEOVER) {
        this.currentTrack = this.soundPlayer.playMusic('deathMusic', false);
      }
    });
  }

  step(_deltaTime: number, root?: Main): void {
    const { input, state } = root!
    if (input.getActionJustPressed('SPACE') && (state.current === STATE_INITIAL || state.current === STATE_LAUNCHING || state.isPlaying))
      this.soundPlayer.play('paddle');
  }

  adjustFruit() {
    this.fruitCount = this.fruitCountUp
      ? this.fruitCount += 1
      : this.fruitCount -= 1;
    if (this.fruitCountUp && this.fruitCount === 5)
      this.fruitCountUp = false;
    else if (!this.fruitCountUp && this.fruitCount === 1)
      this.fruitCountUp = true;
  }
}