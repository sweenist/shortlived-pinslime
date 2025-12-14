import { GameObject } from "./GameObject";

interface CanvasManagerParams {
  main: HTMLCanvasElement,
  integralCanvases?: { [key: string]: HTMLCanvasElement }
}

export class CanvasManager extends GameObject {
  scale: number;
  mainContext: CanvasRenderingContext2D;
  mainCanvas: HTMLCanvasElement;
  integralCanvases?: { [key: string]: HTMLCanvasElement };
  transientCanvases: Record<string, HTMLCanvasElement[]> = {};

  constructor(params: CanvasManagerParams) {
    super();

    this.mainCanvas = params.main
    this.mainContext = this.mainCanvas.getContext('2d')!;
    this.scale = this.mainCanvas.width / this.mainCanvas.clientWidth;

    this.mainCanvas.parentElement?.addEventListener('resize', () => {
      this.mainCanvas.width = Math.floor(this.mainCanvas.parentElement?.offsetWidth ?? this.mainCanvas.width);
      this.mainCanvas.height = Math.floor(this.mainCanvas.parentElement?.clientHeight ?? this.mainCanvas.height);
    });

    this.integralCanvases = params.integralCanvases
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

  remove(id: string) {
    delete this.transientCanvases[id];
    const containerToRemove = (document.querySelector(`#${id}`));
    containerToRemove?.remove();
  }
}