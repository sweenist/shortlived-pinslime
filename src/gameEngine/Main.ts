import { Hero } from '../actors/Hero';
import { fadeIn, fadeOut } from '../constants';
import type { fader } from '../types';
import { Vector2 } from '../utils/vector';
import { Camera } from './Camera';
import { gameEvents } from '../events/Events';
import { GameInput } from './GameInput';
import { GameObject } from './GameObject';
import { Level } from './Level';
import { signals } from '../events/eventConstants';

export interface MainGameParams {
  ctx: CanvasRenderingContext2D;
  position?: Vector2;
  level?: Level;
}

export class Main extends GameObject {
  level?: Level;
  camera: Camera;
  input: GameInput;
  //Fade Effect
  fadeAlpha: number = 0;
  fadeDirection: fader = fadeIn;
  isFading: boolean = false;
  isDesaturating: boolean = false;
  desaturationAlpha: number = 0;
  onFadeOutComplete?: () => void;

  constructor(params: MainGameParams) {
    super(params.position);

    this.camera = new Camera(params.ctx.canvas);
    this.input = new GameInput();

    this.addChild(this.camera);
  }

  ready(): void {

    gameEvents.on<Level>(signals.levelChanging, this, (newLevel) => {
      console.info(`Leaving ${this.level?.constructor.name ?? 'None'}`);
      this.startFade(() => this.setLevel(newLevel));
      console.info(`Loading ${newLevel?.constructor.name ?? 'Error'}`);
    });

    this.input.consolate = () => {
      this.debug(0);
      // inventory.debug(1);
    };
  }

  setLevel(level: Level) {
    if (this.level) {
      this.level.destroy();
    }

    this.level = level;
    this.addChild(this.level);
  }

  stepEntry(deltaTime: number, root: Main): void {
    super.stepEntry(deltaTime, root);

    if (this.input.getActionJustPressed('KeyG')) {
      if (this.isDesaturating) {
        this.isDesaturating = false;
        console.info('Stop desaturation');
      } else {
        this.desaturationAlpha = 10;
        this.isDesaturating = true;
        console.info('desaturating');
      }
    }

    if (this.isFading) this.updateFade(deltaTime);
    if (this.isDesaturating) this.updateDesaturation(deltaTime);
  }

  drawBackground(ctx: CanvasRenderingContext2D) {
    if (this.level?.background) {
      if (this.isDesaturating) {
        ctx.save();
        ctx.filter = `saturate(${100 - this.desaturationAlpha}%)`;
        this.level.background.draw(ctx, Vector2.Zero());
        ctx.restore();
      } else {
        this.level.background.draw(ctx, Vector2.Zero());
      }
    }
  }

  drawObjects(ctx: CanvasRenderingContext2D) {
    this.children.forEach((child) => {
      if (child.drawLayer !== 'USER_INTERFACE') {
        if (this.isDesaturating && !(child instanceof Hero)) {
          ctx.save();
          ctx.filter = `saturate(${100 - this.desaturationAlpha}%)`;
          child.draw(ctx, Vector2.Zero());
          ctx.restore();
        } else {
          child.draw(ctx, Vector2.Zero());
        }
      }
    });
  }

  drawForeground(ctx: CanvasRenderingContext2D) {
    this.children.forEach((child) => {
      if (child.drawLayer === 'USER_INTERFACE') {
        child.draw(ctx, Vector2.Zero());
      }
    });

    if (this.isFading) {
      ctx.save();
      ctx.globalAlpha = 1 - this.fadeAlpha;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }
  }

  startFade(onComplete: () => void) {
    this.isFading = true;
    this.fadeDirection = fadeOut;
    this.fadeAlpha = 0.75;
    this.onFadeOutComplete = onComplete;
  }

  updateFade(deltaTime: number) {
    const fadeSpeed = 0.002;
    this.fadeAlpha += this.fadeDirection * fadeSpeed * deltaTime;

    if (this.fadeDirection === fadeOut && this.fadeAlpha <= 0) {
      this.fadeAlpha = 0;
      this.fadeDirection = 1;
      if (this.onFadeOutComplete) this.onFadeOutComplete();
      this.onFadeOutComplete = undefined;
      gameEvents.emit<Level>(signals.levelChanged, this.level);
    } else if (this.fadeDirection === fadeIn && this.fadeAlpha >= 1) {
      this.fadeAlpha = fadeIn;
      this.isFading = false;
    }
  }

  updateDesaturation(deltaTime: number) {
    if (this.desaturationAlpha < 100) {
      this.desaturationAlpha += deltaTime * 0.5;
      console.info(this.desaturationAlpha);
    }
    if (this.desaturationAlpha > 100) this.desaturationAlpha = 100;
  }
}
