import { signals } from './eventConstants';
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

    console.debug(
      `subscribed ${this.nextId}: ${caller.constructor.name} to ${eventName}`
    );
    return this.nextId;
  }

  off(id: number) {
    this.subscriptions = this.subscriptions.filter((sub) => sub.id !== id);

    console.debug(`unsubscribed event id ${id}`);
  }

  emit<T>(eventName: string, value: T | null = null) {
    this.subscriptions.forEach((sub) => {
      if (sub.eventName === eventName) {
        if (eventName != signals.slimePosition)
          console.debug(
            `emitting ${eventName} from ${sub.caller.constructor.name}`,
            sub.callback
          );
        sub.callback(value);
      }
    });
  }

  unsubscribe(caller: GameObject) {
    this.subscriptions = this.subscriptions.filter(
      (sub) => sub.caller !== caller
    );

    console.debug(
      `unsubscribed caller ${caller.name ?? caller.constructor.name}`
    );
  }
}

export const gameEvents = new Events();
