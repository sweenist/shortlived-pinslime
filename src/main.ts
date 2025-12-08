import './style.css';

import { GameLoop } from './gameEngine/GameLoop';
import { Main } from './gameEngine/Main';
import { gameState } from './game/GameState';

const mainCanvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!;
const mainContext = mainCanvas.getContext('2d')!;

const menuCanvas = document.querySelector<HTMLCanvasElement>('#options-canvas')!;
const menuContext = menuCanvas.getContext('2d')!;
menuContext.imageSmoothingEnabled = false;

const scoreCanvas = document.querySelector<HTMLCanvasElement>('#score-canvas')!
const scoreContext = scoreCanvas.getContext('2d')!;
scoreContext.imageSmoothingEnabled = false;


const mainScene = new Main({ ctx: mainContext });

const update = (deltaTime: number) => {
  mainScene.stepEntry(deltaTime, mainScene);
  gameState.step(deltaTime);
  mainScene.input.update();
};

const draw = () => {
  mainContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
  menuContext.clearRect(0, 0, menuCanvas.width, menuCanvas.height);
  scoreContext.clearRect(0, 0, scoreCanvas.width, scoreCanvas.height);

  mainScene.drawBackground(mainContext);
  mainContext.save();

  mainContext.translate(mainScene.camera.position.x, mainScene.camera.position.y);
  mainScene.drawObjects(mainContext);

  mainContext.restore();

  mainScene.drawForeground(menuContext);
};

const gameLoop = new GameLoop(update, draw);
gameLoop.start();
