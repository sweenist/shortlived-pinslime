import { resources } from "../Resources";

export class SoundPlayer {

  play(name: string): void {
    const sound = resources.sounds.get(name);
    console.info('volume', sound?.sound.volume)
    const clone = sound?.sound.cloneNode(true) as HTMLAudioElement
    if (clone) {
      clone.play().catch((e) => console.error("playback failed", e))
    }
    else {
      console.warn(`No sounds named ${name}`);
    }
  }
}