export type ImageResource = {
  image: HTMLImageElement;
  loaded: boolean;
  name: string;
};

class Resources {
  public toLoad: { [key: string]: string };
  public images: { [key: string]: ImageResource };

  constructor() {
    this.images = {};
    this.toLoad = {
      fontWhite: 'sprites/ArcadeFont.png',
      hero: 'sprites/PinSlime.png',
      slimeTrail: 'sprites/SlimeTrail.png',
      slimeDeath: 'sprites/death-spritesheet.png',
      shadow: 'sprites/shadow.png',
      textbox: 'sprites/text-box.png',
      walls: 'sprites/PingWalls.png',
      paddles: 'sprites/Paddle.png',
      pullknob: 'sprites/PullKnob.png',
    };

    Object.keys(this.toLoad).forEach((key: string) => {
      const image = new Image();

      image.src = this.toLoad[key];
      this.images[key] = { image, loaded: false, name: key };

      image.onload = () => {
        this.images[key].loaded = true;
      };
    });
  }
}

export const resources = new Resources();
