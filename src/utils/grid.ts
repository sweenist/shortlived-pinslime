import { Vector2 } from './vector';

export const gridCells = (n: number) => {
  return n * 16;
};

export const isSpaceFree = (walls: Set<string>, destination: Vector2) => {
  return !walls.has(destination.toString());
};
