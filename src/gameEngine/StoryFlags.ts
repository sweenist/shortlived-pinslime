import type { DialogueScenario } from '../types';

class StoryFlags {
  flags: Map<string, boolean> = new Map<string, boolean>();
  constructor() {}

  add(flag: string) {
    this.flags.set(flag, true);
  }

  getScenario(scenarios: DialogueScenario[]): DialogueScenario | null {
    return (
      scenarios.find((scene) => {
        const bypass = scene.bypass ?? [];
        for (let i = 0; i < bypass.length; i++) {
          const currentFlag = bypass[i];
          if (this.flags.has(currentFlag)) {
            console.warn('bypassing', currentFlag);
            return false;
          }
        }

        const required = scene.requires ?? [];
        for (let i = 0; i < required.length; i++) {
          const essential = required[i];
          if (!this.flags.has(essential)) {
            console.info('interaction requires:', essential);
            return false;
          }
        }
        return true;
      }) ?? null
    );
  }

  enumerate() {
    for (const key of this.flags.keys()) {
      console.info('\tflag:', key);
    }
  }
}

export const storyFlags = new StoryFlags();
