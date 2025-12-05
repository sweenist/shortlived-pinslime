import { soundTriggers } from "../events/eventConstants";
import { gameEvents } from "../events/Events";
import { GameObject } from "../gameEngine/GameObject";
import { SoundPlayer } from "./SoundPlayer";

export class SoundManager extends GameObject {
  soundPlayer: SoundPlayer;
  fruitCount: number = 0;
  fruitCountUp: boolean = true;

  constructor() {
    super();

    this.soundPlayer = new SoundPlayer();
  }

  ready(): void {
    gameEvents.on(soundTriggers.playMoveCursor, this, () => {
      this.soundPlayer.play('selectDing');
    });

    gameEvents.on(soundTriggers.playFruit, this, () => {
      this.adjustFruit();
      console.info('sound', this.fruitCount, this.fruitCountUp)
      this.soundPlayer.play(`fruitCollect${this.fruitCount}`);
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