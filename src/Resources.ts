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
      fontWhite: 'sprites/sprite-font-white.png',
      hero: 'sprites/redslime.png',
      shadow: 'sprites/shadow.png',
      textbox: 'sprites/text-box.png',
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
