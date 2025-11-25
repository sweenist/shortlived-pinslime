import { Vector2 } from '../utils/vector';
import { gameEvents } from '../events/Events';
import type { Main } from './Main';
import type { DrawLayers } from '../types';

export class GameObject {
  children: GameObject[] = [];
  position: Vector2;
  parent?: GameObject | null;
  isReady: boolean = false;
  isSolid: boolean = false;
  name?: string;
  drawLayer: DrawLayers = 'DEFAULT';

  constructor(position?: Vector2) {
    this.position = position ?? Vector2.Zero();
  }

  ready(): void {
    // override
  }

  stepEntry(deltaTime: number, root: Main) {
    this.children.forEach((child) => child.stepEntry(deltaTime, root));
    if (!this.isReady) {
      this.isReady = true;
      this.ready();
    }
    this.step(deltaTime, root);
  }

  step(_deltaTime: number, _root?: Main) {
    // override
  }

  draw(
    ctx: CanvasRenderingContext2D,
    position: Vector2,
    _debug: boolean = false
  ) {
    const drawPosition = position.add(this.position);

    this.drawImage(ctx, drawPosition);

    this.getOrderedDrawSprites().forEach((child) =>
      child.draw(ctx, drawPosition)
    );
  }

  drawForeground(ctx: CanvasRenderingContext2D) {
    this.children.forEach((child) => {
      child.drawForeground(ctx);
      if (child.drawLayer === 'USER_INTERFACE') {
        // console.info(child.name)
        child.draw(ctx, Vector2.Zero());
      }
    });
  }

  getOrderedDrawSprites() {
    return [...this.children].sort((src, target) => {
      if (target.drawLayer === 'GROUND') return 1;
      if (target.drawLayer === 'SKY') return -1;
      return src.position.y > target.position.y ? 1 : -1;
    });
  }

  drawImage(
    _ctx: CanvasRenderingContext2D,
    _position: Vector2,
    debug: boolean = false
  ) {
    // override
    if (debug) console.debug(this);
  }

  destroy() {
    this.children.forEach((child) => child.destroy());

    this.parent?.removeChild(this);
  }

  addChild(gameObject: GameObject) {
    gameObject.parent = this;
    this.children.push(gameObject);
  }

  removeChild(gameObject: GameObject) {
    // console.debug(`Removing child ${this.constructor.name}`);
    gameEvents.unsubscribe(gameObject);
    this.children = this.children.filter((g) => {
      return gameObject !== g;
    });
    gameObject.parent = null;
  }

  tryRemoveChild(gameObject?: GameObject | null): boolean {
    if (gameObject) {
      this.removeChild(gameObject);
    }
    return !!gameObject;
  }

  debug(level: number) {
    const arrow = '-'.repeat(level + 1);

    console.debug(
      `${arrow}> ${this.constructor.name}, position: ${this.position} Parent: ${this.parent?.constructor.name} Name: ${this.name ?? ''} Ready: ${this.isReady}`
    );
    this.children.forEach((child) => {
      child.debug(level + 1);
    });
  }
}
