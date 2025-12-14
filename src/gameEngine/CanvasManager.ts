import { GameObject } from "./GameObject";

type Visual = {
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D
}

class CanvasManager extends GameObject {
  scale: number;
  mainContext: CanvasRenderingContext2D;
  mainCanvas: HTMLCanvasElement;
  integralCanvases: { [key: string]: Visual } = {};
  transientCanvases: Record<string, HTMLCanvasElement[]> = {};

  constructor() {
    super();

    this.mainCanvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!;
    this.mainContext = this.mainCanvas.getContext('2d')!;
    this.scale = this.mainCanvas.width / this.mainCanvas.clientWidth;

    this.mainCanvas.parentElement?.addEventListener('resize', () => {
      this.mainCanvas.width = Math.floor(this.mainCanvas.parentElement?.offsetWidth ?? this.mainCanvas.width);
      this.mainCanvas.height = Math.floor(this.mainCanvas.parentElement?.clientHeight ?? this.mainCanvas.height);
    });

  }

  build(canvases: { [key: string]: HTMLCanvasElement }) {
    //TODO: rethink this data structure
    Object.keys(canvases).forEach((key) => {
      const context = canvases[key].getContext('2d')!;
      context.imageSmoothingEnabled = false;
      this.integralCanvases[key] = { canvas: canvases[key], context };
    });
  }

  clear() {
    this.mainContext.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
    Object.values(this.integralCanvases).forEach((visual) => {
      visual.context.clearRect(0, 0, visual.canvas.width, visual.canvas.height);
    });

    //TODO: clear transient
  }

  createCanvas(id: string, parentElement: HTMLElement, zIndex: number = 1): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    //determine a css class for all these common things
    canvas.id = id;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = zIndex.toString();
    parentElement.appendChild(canvas);
    this.transientCanvases[id].push(canvas);
    return canvas;
  }

  getContext(id: string) {
    return this.integralCanvases[id]?.context ?? null;
  }

  remove(id: string) {
    delete this.transientCanvases[id];
    const containerToRemove = (document.querySelector(`#${id}`));
    containerToRemove?.remove();
  }
}

export const canvasManager = new CanvasManager();