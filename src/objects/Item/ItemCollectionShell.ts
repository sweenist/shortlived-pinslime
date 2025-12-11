import { signals } from "../../events/eventConstants";
import { gameEvents } from "../../events/Events";
import { GameObject } from "../../gameEngine/GameObject";
import type { Main } from "../../gameEngine/Main";
import { FadeableSprite } from "../../gameEngine/Sprite";
import type { ItemEventMetaData } from "../../types/eventTypes";
import { Vector2, spriteSize } from "../../utils/vector";
import { ScoreToast } from "../TextBox/ScoreToast";

const DISPLAY_COOLDOWN = 750;
const SCORE_FADE_DURATION = 500;
const ITEM_FLOAT_STEP = new Vector2(0, -0.5);

interface DisplayPickup {
  id: number,
  displayCooldown: number,
  item: FadeableSprite,
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
      const item = new FadeableSprite({
        resource: data.image,
        frameSize: spriteSize,
        position: new Vector2(0, -18),
        name: `item-${this.id}`,
      });

      this.addChild(score);
      this.addChild(item);

      this.toast.push({
        id: this.id,
        displayCooldown: DISPLAY_COOLDOWN,
        score,
        item
      });

      this.toast.forEach((toast) => {
        if (toast.id == this.id) return;
        toast.score.position = toast.score.position.add(new Vector2(0, -14));
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

      const fade = this.calculateAlpha(t.displayCooldown);
      t.score.alpha = fade;
      t.item.alpha = fade;
      t.item.position = t.item.position.add(ITEM_FLOAT_STEP);
    });

    this.toast = this.toast.filter((t) => !toastsToDelete.includes(t.id));
  }

  private calculateAlpha(timeRemaining: number): number {
    if (timeRemaining >= SCORE_FADE_DURATION) return 1;
    if (timeRemaining <= 0) return 0;

    const t = timeRemaining / SCORE_FADE_DURATION;
    return 1 - Math.pow(1 - t, 3);
  }
}