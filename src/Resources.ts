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
      caveBackground: 'sprites/cave.png',
      caveForeground: 'sprites/cave-ground.png',
      customOverworld: 'sprites/overworld.png',
      custom2: 'sprites/grasspaths.png',
      custom3: 'sprites/water.png',
      exit: 'sprites/exit.png',
      fontWhite: 'sprites/sprite-font-white.png',
      ground: 'sprites/ground.png',
      hero: 'sprites/hero-sheet.png',
      knight: 'sprites/knight-sheet.png',
      portraits: 'sprites/portraits-sheet.png',
      rod: 'sprites/rod.png',
      shadow: 'sprites/shadow.png',
      sky: 'sprites/sky.png',
      slimeRed: 'sprites/redslime.png',
      spritesheet: 'sprites/spritesheet.png',
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
