import { STATE_DEAD, STATE_LOADING, STATE_NAMES, STATE_TITLE } from "../constants";
import { signals, soundTriggers } from "../events/eventConstants";
import { gameEvents } from "../events/Events";
import { GameObject } from "../gameEngine/GameObject";
import type { SOUND_NAMES } from "../types";
import { SoundPlayer } from "./SoundPlayer";

export class SoundManager extends GameObject {
  soundPlayer: SoundPlayer;
  fruitCount: number = 0;
  fruitCountUp: boolean = true;
  currentTrack: HTMLAudioElement | null = null;

  constructor() {
    super();

    this.soundPlayer = new SoundPlayer();
  }

  ready(): void {
    this.currentTrack = this.soundPlayer.playMusic('titleMusic', false);

    gameEvents.on(soundTriggers.playMoveCursor, this, () => {
      this.soundPlayer.play('selectDing');
    });

    gameEvents.on(soundTriggers.playFruit, this, () => {
      this.adjustFruit();
      this.soundPlayer.play(`fruitCollect${this.fruitCount}` as unknown as SOUND_NAMES);
    });

    gameEvents.on(soundTriggers.playSelectionConfirmed, this, () => {
      // this.soundPlayer.play('confirmation');
      //need smaller duration noise
    });

    gameEvents.on<typeof STATE_NAMES[number]>(signals.stateChanged, this, (value) => {
      if (value === STATE_TITLE) {
        this.currentTrack = this.soundPlayer.playMusic('titleMusic', false);
      }
      else if (value === STATE_LOADING) {
        if (this.currentTrack)
          this.soundPlayer.fadeOut(this.currentTrack);
        this.soundPlayer.play('confirmation')
      }
      else if (value === STATE_DEAD) {
        console.info('Dead... play sound')
        this.soundPlayer.play('collisionDeath');
      }
    });
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