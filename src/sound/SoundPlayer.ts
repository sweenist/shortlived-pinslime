import { resources, type SoundResource } from "../Resources";
import type { SOUND_NAMES } from "../types";

export class SoundPlayer {
  musicEnabled: boolean = true;
  soundEffectsEnabled: boolean = true;


  play(name: SOUND_NAMES): void {
    if (!this.soundEffectsEnabled) return;
    const sound = resources.sounds.get(name);
    const clone = sound?.sound.cloneNode(true) as HTMLAudioElement

    if (clone) {
      clone.play().catch((e) => console.error("playback failed", e))
    }
    else {
      console.warn(`No sounds named ${name}`);
    }
  }

  playMusic(name: SOUND_NAMES, loop: boolean): SoundResource | null {
    const music = resources.sounds.get(name);

    if (!music) {
      console.error('No music!', music, name);
      return null;
    }
    const audio = music.sound;
    audio.loop = loop;
    audio.play().catch((e) => console.error('muzak died', e));
    return music;
  }

  fadeOut(audio: HTMLAudioElement, duration: number = 1250): Promise<void> {
    return new Promise((res) => {
      const start = performance.now();
      const startVolume = audio.volume;
      const step = (now: number) => {
        const time = Math.min(1, (now - start) / duration)
        audio.volume = Math.max(0, startVolume * (1 - time));
        if (time < 1) requestAnimationFrame(step);
        else {
          try {
            audio.pause();
            audio.currentTime = 0;
          }
          catch { } //noop?
          audio.volume = startVolume;
          res();
        }
      };
      requestAnimationFrame(step);
    });
  }
}