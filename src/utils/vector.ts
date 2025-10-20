import { DOWN, LEFT, RIGHT, UP } from '../constants';
import type { Direction } from '../types';

export interface Vector2Interface {
  x: number;
  y: number;
}

export class Vector2 implements Vector2Interface {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  duplicate() {
    return new Vector2(this.x, this.y);
  }

  add(addend: Vector2) {
    return new Vector2(this.x + addend.x, this.y + addend.y);
  }

  public toString(): string {
    return `x: ${this.x}, y: ${this.y}`;
  }

  public static Zero(): Vector2 {
    return new Vector2(0, 0);
  }

  public static fromPoint(point: { x: number; y: number }, shift: number = 1): Vector2 {
    return new Vector2(point.x * shift, point.y * shift);
  }

  /*
  Returns whether a comparative vector matches the source vector.
  @param that a target vector to compare against.
  @returns true if the target vector components equal components of source vector.
  */
  equals(that: Vector2) {
    return this.x === that.x && this.y === that.y;
  }

  adjacent(facing: Direction) {
    switch (facing) {
      case UP:
        return new Vector2(this.x, this.y - 16);
      case DOWN:
        return new Vector2(this.x, this.y + 16);
      case LEFT:
        return new Vector2(this.x - 16, this.y);
      case RIGHT:
        return new Vector2(this.x + 16, this.y);
    }
  }

  /*
  Returns whether a comparative vector rounds to the components of the source vector.
  @param that a transient vector to compare against.
  @returns true if the transient vector rounds to the source vector.
  */
  prettyClose(that: Vector2) {
    return Math.round(that.x) === this.x && Math.round(that.y) === this.y;
  }
}
