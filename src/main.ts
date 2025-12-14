import './style.css';

import { GameLoop } from './gameEngine/GameLoop';
import { Main } from './gameEngine/Main';
import { gameState } from './game/GameState';
import { canvasManager } from './gameEngine/CanvasManager';

canvasManager.build({
  'options': document.querySelector<HTMLCanvasElement>('#options-canvas')!,
  'score': document.querySelector<HTMLCanvasElement>('#score-canvas')!
});

const mainScene = new Main({});

const update = (deltaTime: number) => {
  mainScene.stepEntry(deltaTime, mainScene);
  gameState.step(deltaTime);
  mainScene.input.update();
};

const draw = () => {
  canvasManager.clear();

  const mainContext = canvasManager.mainContext;
  mainScene.drawBackground(mainContext);
  mainContext.save();

  mainContext.translate(mainScene.camera.position.x, mainScene.camera.position.y);
  mainScene.drawObjects(mainContext);

  mainContext.restore();

  mainScene.drawForeground();
};

const gameLoop = new GameLoop(update, draw);
gameLoop.start();
