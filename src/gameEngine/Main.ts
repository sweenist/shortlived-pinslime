import { Slime } from '../actors/Slime';
import { fadeIn, fadeOut, STATE_GAMEOVER, STATE_INITIAL, STATE_TITLE } from '../constants';
import type { fader } from '../types';
import { Vector2 } from '../utils/vector';
import { Camera } from './Camera';
import { gameEvents } from '../events/Events';
import { GameInput } from './GameInput';
import { GameObject } from './GameObject';
import { Level } from './Level';
import { signals } from '../events/eventConstants';
import { GameState } from '../game/GameState';
import { Title } from '../game/Title';
import { OptionDialog } from '../objects/TextBox/OptionDialog';
import { Pinball } from '../levels/Pinball';
import { configurationManager } from '../levels/configurationManager';
import { SoundManager } from '../sound/SoundManager';

export interface MainGameParams {
  ctx: CanvasRenderingContext2D;
  position?: Vector2;
  level?: Level;
}

export class Main extends GameObject {
  level?: Level;
  title?: Title;
  camera: Camera;
  input: GameInput;
  state: GameState;
  soundManager: SoundManager;
  optionsMenu?: OptionDialog;
  //Fade Effect
  fadeAlpha: number = 0;
  fadeDirection: fader = fadeIn;
  isFading: boolean = false;
  isDesaturating: boolean = false;
  desaturationAlpha: number = 0;
  onFadeOutComplete?: () => void;

  constructor(params: MainGameParams) {
    super(params.position);

    this.camera = new Camera(params.ctx.canvas, true);
    this.input = new GameInput();
    this.title = new Title();
    this.state = new GameState();
    this.soundManager = new SoundManager();

    this.addChild(this.camera);
    this.addChild(this.title);
    this.addChild(this.soundManager);
  }

  ready(): void {
    gameEvents.on<Level | Title>(signals.levelChanging, this, (newLevel) => {
      if (newLevel instanceof Level) {
        this.title?.destroy();
        this.setLevel(newLevel);
      } else if (newLevel instanceof Title) {
        this.level?.destroy();
        this.state.set(STATE_TITLE);
        this.title = newLevel;
        this.camera.position = Vector2.Zero();
        this.addChild(this.title);
      }
    });

    gameEvents.on<typeof this.state.current>(signals.stateChanged, this, (value) => {
      if (value === STATE_TITLE) {
        this.displayScore(false);
        this.showOptionsForTitle();
      }
      else if (value === STATE_GAMEOVER) {
        const slime = (this.level as Pinball).children.filter((s) => s.name === 'slime')[0] as Slime
        if (!slime.isLevelBuilding) {
          this.showOptionsForGameOver();
        }
      }
      else {
        this.hideOptions();
        this.displayScore(true)
      }
    });

    this.input.consolate = () => {
      this.debug(0);
    };

    this.showOptionsForTitle();
  }

  displayScore(show: boolean) {
    const scoreDiv = document.querySelector<HTMLDivElement>('#score');
    if (show)
      scoreDiv?.classList.add('playing');
    else
      scoreDiv?.classList.remove('playing');
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
    this.state.step(deltaTime);

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
        if (this.isDesaturating && !(child instanceof Slime)) {
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
    super.drawForeground(ctx);

    if (this.isFading) {
      ctx.save();
      ctx.globalAlpha = 1 - this.fadeAlpha;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }
  }

  private hideOptions() {
    if (this.optionsMenu) {
      this.optionsMenu.destroy();
      this.optionsMenu = undefined;
    }
  }

  private showOptionsForTitle() {
    this.hideOptions();
    this.optionsMenu = new OptionDialog({
      divId: '#options',
      canvasId: '#options-canvas',
      options: [
        {
          text: 'play',
          action: () => {
            gameEvents.emit(signals.levelChanging, new Pinball(configurationManager[0]));
          }
        }]
    });

    this.addChild(this.optionsMenu);
  }
  private showOptionsForGameOver() {
    this.hideOptions();
    this.optionsMenu = new OptionDialog({
      divId: '#options',
      canvasId: '#options-canvas',
      options: [
        {
          text: 'retry',
          action: () => {
            const levelConfig = (this.level as Pinball)?.levelConfiguration
            gameEvents.emit(signals.levelChanging, new Pinball(levelConfig));
            this.state.set(STATE_INITIAL);
            console.info('retry')
          }
        },
        {
          text: 'quit',
          action: () => {
            this.state.set(STATE_TITLE);
            gameEvents.emit(signals.levelChanging, new Title())
          }
        }
      ]
    });

    this.addChild(this.optionsMenu);
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
