export type ImageResource = {
  image: HTMLImageElement;
  loaded: boolean;
  name: string;
};

export type SoundResource = {
  sound: HTMLAudioElement;
  loaded: boolean;
  name: string;
  defaultVolume: number;
}

class Resources {
  private imagesToLoad: { [key: string]: string };
  public soundsToLoad: { [key: string]: string };

  public images: { [key: string]: ImageResource };
  public sounds: Map<string, SoundResource> = new Map();

  constructor() {
    this.images = {};
    this.imagesToLoad = {
      //font
      font: 'sprites/ArcadeFont.png',
      cursor: 'sprites/Cursor.png',
      _frame: 'sprites/FrameBlue.png',
      //large images
      levelBackground: 'sprites/CircuitBoard.png',
      title: 'sprites/TitleScreen.png',
      titletext: 'sprites/TitleText.png',
      //sprites
      gizmo: 'sprites/gizmo.png',
      hero: 'sprites/PinSlime.png',
      paddles: 'sprites/Paddle.png',
      pullPin: 'sprites/PullPin.png',
      pullKnob: 'sprites/Knob.png',
      ramps: 'sprites/Ramps.png',
      shadow: 'sprites/shadow.png',
      slimeTrail: 'sprites/SlimeTrail.png',
      slimeDeath: 'sprites/death-spritesheet.png',
      stopwatch: 'sprites/Stopwatch.png',
      textbox: 'sprites/text-box.png',
      wallsBlue: 'sprites/Walls-Blue.png',
      wallsGreen: 'sprites/Walls-Green.png',
      floors: 'sprites/Floor.png',
      //Items
      grape: 'sprites/Grape.png',
      orange: 'sprites/Orange.png',
    };

    this.soundsToLoad = {
      selectDing: 'sounds/SelectionChange.wav',
      confirmation: 'sounds/Select.wav',
      fruitCollect1: 'sounds/FruitCollect1.mp3',
      fruitCollect2: 'sounds/FruitCollect2.mp3',
      fruitCollect3: 'sounds/FruitCollect3.mp3',
      fruitCollect4: 'sounds/FruitCollect4.mp3',
      fruitCollect5: 'sounds/FruitCollect5.mp3',
      countDown: 'sounds/CountDown.mp3',
      paddle: 'sounds/Paddle.wav',
      collisionDeath: 'sounds/CollideSplatter.mp3',
      timeOutDeath: 'sounds/ExpireSplatter.mp3',
      titleMusic: 'sounds/TitleTheme.mp3',
      deathMusic: 'sounds/DeathKnell.mp3',
      levelMusic: 'sounds/PinballMachine.mp3'
    }

    Object.keys(this.imagesToLoad).forEach((key: string) => {
      const image = new Image();

      image.src = this.imagesToLoad[key];
      this.images[key] = { image, loaded: false, name: key };

      image.onload = () => {
        this.images[key].loaded = true;
      };
    });

    Object.keys(this.soundsToLoad).forEach((key: string) => {
      const sound = new Audio();
      sound.preload = 'auto';
      sound.volume = 0.85;

      sound.src = this.soundsToLoad[key];
      this.sounds.set(key, { sound, loaded: false, name: key, defaultVolume: 0.85 });
      sound.addEventListener('canplaythrough', () => { console.info(`Can play ${key}`) });
    });
  }
}

export const resources = new Resources();
