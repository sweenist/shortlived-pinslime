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
      //font
      fontWhite: 'sprites/ArcadeFont.png',
      //large images
      levelBackground: 'sprites/CircuitBoard.png',
      //sprites
      gizmo: 'sprites/gizmo.png',
      hero: 'sprites/PinSlime.png',
      paddles: 'sprites/Paddle.png',
      pullknob: 'sprites/PullKnob.png',
      ramps: 'sprites/Ramps.png',
      shadow: 'sprites/shadow.png',
      slimeTrail: 'sprites/SlimeTrail.png',
      slimeDeath: 'sprites/death-spritesheet.png',
      textbox: 'sprites/text-box.png',
      walls: 'sprites/PingWalls.png',
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
