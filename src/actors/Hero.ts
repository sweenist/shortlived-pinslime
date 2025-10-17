import { Animations } from '../gameEngine/Animations';
import { FrameIndexPattern } from '../gameEngine/FrameIndexPattern';
import { DOWN, LEFT, RIGHT, UP } from '../constants';
import { GameObject } from '../gameEngine/GameObject';
import { resources } from '../Resources';
import { Sprite } from '../gameEngine/Sprite';
import { isSpaceFree } from '../utils/grid';
import { toTitleCase } from '../utils/stringUtils';
import { Vector2 } from '../utils/vector';
import {
  WALK_DOWN,
  WALK_UP,
  WALK_LEFT,
  WALK_RIGHT,
  STAND_DOWN,
  STAND_UP,
  STAND_LEFT,
  STAND_RIGHT,
  PICK_UP_DOWN,
} from './heroAnimations';
import { moveTowards } from '../utils/moveUtils';
import { gameEvents } from '../events/Events';
import type { ItemEventMetaData } from '../types/eventTypes';
import type { Main } from '../gameEngine/Main';
import type { Direction } from '../types';
import { signals } from '../events/eventConstants';

export class Hero extends GameObject {
  facingDirection: Direction;
  destinationPosition: Vector2;
  body: Sprite;
  shadow: Sprite;
  itemPickupTime: number = 0;
  itemPickupShell?: GameObject;
  isLocked: boolean = false;

  constructor(position: Vector2) {
    super(position);
    this.shadow = new Sprite({
      resource: resources.images.shadow,
      frameSize: new Vector2(32, 32),
      position: new Vector2(-8, -19),
    });
    this.addChild(this.shadow);

    this.body = new Sprite({
      resource: resources.images.hero,
      frameSize: new Vector2(32, 32),
      frameColumns: 3,
      frameRows: 8,
      frameIndex: 1,
      position: new Vector2(-8, -20),
      animations: new Animations({
        standDown: new FrameIndexPattern(STAND_DOWN),
        standUp: new FrameIndexPattern(STAND_UP),
        standLeft: new FrameIndexPattern(STAND_LEFT),
        standRight: new FrameIndexPattern(STAND_RIGHT),
        walkDown: new FrameIndexPattern(WALK_DOWN),
        walkUp: new FrameIndexPattern(WALK_UP),
        walkLeft: new FrameIndexPattern(WALK_LEFT),
        walkRight: new FrameIndexPattern(WALK_RIGHT),
        pickUpDown: new FrameIndexPattern(PICK_UP_DOWN),
      }),
    });

    this.addChild(this.body);

    this.facingDirection = DOWN;
    this.destinationPosition = this.position.duplicate();
  }

  ready(): void {
    gameEvents.on<ItemEventMetaData>(signals.heroItemCollect, this, (value) =>
      this.onItemCollect(value)
    );

    gameEvents.on(
      signals.startTextInteraction,
      this,
      () => (this.isLocked = true)
    );

    gameEvents.on(
      signals.endTextInteraction,
      this,
      () => (this.isLocked = false)
    );

    gameEvents.on(signals.levelChanging, this, () => {
      this.isLocked = true;
      this.destinationPosition = this.position.duplicate();
      this.body.animations?.play(
        'stand'.concat(toTitleCase(this.facingDirection))
      );
    });
  }

  step(deltaTime: number, root: Main) {
    if (this.itemPickupTime > 0) {
      this.processOnItemPickup(deltaTime);
      return;
    }

    const { input } = root;
    if (input.getActionJustPressed('Space') && !this.isLocked) {
      const interactablePosition = this.parent?.children.find((c) => {
        return c.position.equals(this.position.adjacent(this.facingDirection));
      });

      if (interactablePosition) {
        gameEvents.emit(signals.heroInteraction, interactablePosition);
      }
    }

    if (input.getActionJustPressed('KeyH')) {
      this.body.isVisible = !this.body.isVisible;
    }

    const distance = moveTowards(this.position, this.destinationPosition, 1);
    const hasArrived = distance < 1;
    if (hasArrived) {
      this.tryMove(root);
    }

    gameEvents.emit(signals.heroPosition, this.position);
  }

  tryMove(root: Main) {
    if (this.isLocked || root.isFading) return;

    const { input, level } = root;

    if (!input.direction) {
      this.body.animations?.play(
        'stand'.concat(toTitleCase(this.facingDirection))
      );
      return;
    }

    let nextX = this.destinationPosition.x;
    let nextY = this.destinationPosition.y;

    const gridSize = 16;

    if (input.direction === UP) {
      nextY -= gridSize;
      this.body.animations?.play('walkUp');
    }
    if (input.direction === DOWN) {
      nextY += gridSize;
      this.body.animations?.play('walkDown');
    }
    if (input.direction === LEFT) {
      nextX -= gridSize;
      this.body.animations?.play('walkLeft');
    }
    if (input.direction === RIGHT) {
      nextX += gridSize;
      this.body.animations?.play('walkRight');
    }

    const destination = new Vector2(nextX, nextY);
    this.facingDirection = input.direction ?? this.facingDirection;

    const isWalkable = isSpaceFree(level!.walls, destination);
    const hasActor = this.parent?.children.find((child) => {
      return child.isSolid && child.position.equals(destination);
    });

    if (!isWalkable || hasActor) return;

    this.destinationPosition = destination;
  }

  processOnItemPickup(delta: number) {
    this.itemPickupTime -= delta;
    this.body.animations?.play('pickUpDown');

    if (this.itemPickupTime <= 0) {
      this.itemPickupShell?.destroy();
    }
  }

  onItemCollect(value: ItemEventMetaData) {
    const { position, image } = value;
    this.position = position.duplicate();

    this.itemPickupTime = 1250;

    this.itemPickupShell = new GameObject();
    this.itemPickupShell.addChild(
      new Sprite({
        resource: image,
        position: new Vector2(0, -18),
      })
    );
    this.addChild(this.itemPickupShell);
  }

  debug(level: number) {
    const arrow = '-'.repeat(level + 1);

    console.debug(
      `${arrow}> ${this.constructor.name}, position: ${this.position} [${
        this.position.x / 16
      }, ${this.position.y / 16}] Parent: ${this.parent?.constructor.name}`
    );
    this.children.forEach((child) => {
      child.debug(level + 1);
    });
  }
}
