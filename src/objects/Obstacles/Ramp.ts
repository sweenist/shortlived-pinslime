import type { deflectionCoefficient } from "../../types";
import Obstacle, { type ObstacleParams } from "./Obstacle";

export interface RampParams extends ObstacleParams {
  deflection: deflectionCoefficient;
}

export class Ramp extends Obstacle {
  deflection: deflectionCoefficient;

  constructor(params: RampParams) {
    super(params as ObstacleParams);
    this.deflection = params.deflection;
  }
}