import type { Vector2 } from './vector';

export function moveTowards(actorPosition: Vector2, destination: Vector2, speed: number) {
  let traverseX = destination.x - actorPosition.x;
  let traverseY = destination.y - actorPosition.y;

  let distance = Math.sqrt(traverseX ** 2 + traverseY ** 2);//euclidean distance

  if (distance < speed) {
    actorPosition = destination;
  }
  else {
    const normailzedX = traverseX / distance;
    const normailzedY = traverseY / distance;

    actorPosition.x += normailzedX * speed;
    actorPosition.y += normailzedY * speed;

    traverseX = destination.x - actorPosition.x;
    traverseY = destination.y - actorPosition.y;
    distance = Math.sqrt(traverseX ** 2 + traverseY ** 2);
  }
  return distance;
}