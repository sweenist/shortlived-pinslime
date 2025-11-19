import type { GameObject } from '../gameEngine/GameObject';

interface Subscription<T> {
  id: number;
  eventName: string;
  caller: GameObject;
  callback: { (value: T): void };
}

class Events {
  nextId: number = 0;
  subscriptions: Subscription<any>[] = [];

  on<T>(eventName: string, caller: GameObject, callback: { (value: T): void }) {
    this.nextId += 1;
    this.subscriptions.push({
      id: this.nextId,
      eventName,
      caller,
      callback,
    });

    return this.nextId;
  }

  off(id: number) {
    this.subscriptions = this.subscriptions.filter((sub) => sub.id !== id);
  }

  emit<T>(eventName: string, value: T | null = null) {
    this.subscriptions.forEach((sub) => {
      if (sub.eventName === eventName) {
        sub.callback(value);
      }
    });
  }

  unsubscribe(caller: GameObject) {
    this.subscriptions = this.subscriptions.filter(
      (sub) => sub.caller !== caller
    );
  }
}

export const gameEvents = new Events();
