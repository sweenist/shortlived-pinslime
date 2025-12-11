import { signals } from "../../events/eventConstants";
import { gameEvents } from "../../events/Events";
import { GameObject } from "../../gameEngine/GameObject";
import type { Main } from "../../gameEngine/Main";
import { Sprite } from "../../gameEngine/Sprite";
import type { ItemEventMetaData } from "../../types/eventTypes";
import { Vector2, spriteSize } from "../../utils/vector";
import { ScoreToast } from "../TextBox/ScoreToast";

const DISPLAY_COOLDOWN = 750;
const SCORE_FADE_DURATION = 500;
const ITEM_FLOAT_STEP = new Vector2(0, -1);

interface DisplayPickup {
  id: number,
  displayCooldown: number,
  item: Sprite,
  score: ScoreToast,
};

export class ItemCollectionShell extends GameObject {
  toast: DisplayPickup[] = [];
  id: number = 0;

  constructor() {
    super();
  }

  ready(): void {
    gameEvents.on<ItemEventMetaData>(signals.slimeItemCollect, this, (data) => {
      this.id += 1;

      const score = new ScoreToast({ position: new Vector2(20, -12), score: `${data.points}` });
      const item = new Sprite({
        resource: data.image,
        frameSize: spriteSize,
        position: new Vector2(0, -18),
        name: 'item'
      });

      this.toast.push({
        id: this.id,
        displayCooldown: DISPLAY_COOLDOWN,
        score,
        item
      });

      this.toast.forEach((toast) => {
        if (toast.id == this.id) return;
        toast.score.position.add(new Vector2(0, -12));
      })
    });
  }


  step(deltaTime: number, _root?: Main): void {
    const toastsToDelete: number[] = [];
    this.toast.forEach((t) => {
      t.displayCooldown -= deltaTime;
      if (t.displayCooldown <= 0) {
        toastsToDelete.push(t.id)
        t.score.destroy();
        t.item.destroy();
        return;
      }
      t.score.alpha = this.calculateAlpha(t.displayCooldown);
      t.item.position.add(ITEM_FLOAT_STEP);
    });

    this.toast = this.toast.filter((t) => !toastsToDelete.includes(t.id));
  }

  private calculateAlpha(timeRemaining: number) {
    if (timeRemaining >= SCORE_FADE_DURATION) return 1;
    if (timeRemaining <= 0) return 0;

    const t = timeRemaining / SCORE_FADE_DURATION;
    return 1 - Math.pow(1 - t, 3);
  }
}