import { spriteSize, type Vector2 } from './vector';

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

export function updateMidPoint(position: Vector2, midPoint: Vector2, offset: number = 8) {
  midPoint.x = position.x + offset;
  midPoint.y = position.y + offset;
}

export function calculateCollision(sourcePosition: Vector2, targetPosition: Vector2): number {
  const sourceExtrema = sourcePosition.add(spriteSize);
  const targetExtrema = targetPosition.add(spriteSize);

  const overlapX = Math.max(0, Math.min(sourceExtrema.x, targetExtrema.x) - Math.max(sourcePosition.x, targetPosition.x));
  const overlapY = Math.max(0, Math.min(sourceExtrema.y, targetExtrema.y) - Math.max(sourcePosition.y, targetPosition.y));

  return overlapX * overlapY;
}