import type { deflectionCoefficient, Direction } from "../../types";
import Obstacle, { type ObstacleParams } from "./Obstacle";

export interface RampParams extends ObstacleParams {
  deflection: deflectionCoefficient;
  approaches: Direction[]
}

export class Ramp extends Obstacle {
  deflection: deflectionCoefficient;
  approaches: Direction[] = [];

  constructor(params: RampParams) {
    super(params as ObstacleParams);
    this.deflection = params.deflection;
    this.approaches = params.approaches;
  }

  canTurn(facing: Direction) {
    return this.approaches.some((approach) => facing === approach);
  }
}