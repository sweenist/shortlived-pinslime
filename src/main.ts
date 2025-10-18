import './style.css';

import { GameLoop } from './gameEngine/GameLoop';
import { Main } from './gameEngine/Main';
import { gridCells } from './utils/grid';
import { Vector2 } from './utils/vector';
import { Pinball } from './levels/Pinball';

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!;
const ctx = canvas.getContext('2d')!;

const mainScene = new Main({ ctx });

mainScene.setLevel(
  new Pinball({ actorPosition: new Vector2(gridCells(9), gridCells(8)) })
);

const update = (deltaTime: number) => {
  mainScene.stepEntry(deltaTime, mainScene);
  mainScene.input.update();
};

const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  mainScene.drawBackground(ctx);
  ctx.save();

  ctx.translate(mainScene.camera.position.x, mainScene.camera.position.y);
  mainScene.drawObjects(ctx);

  ctx.restore();

  mainScene.drawForeground(ctx);
};

const gameLoop = new GameLoop(update, draw);
gameLoop.start();
