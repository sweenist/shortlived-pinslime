import { STATE_INITIAL, STATE_TITLE } from "../constants";
import { signals, soundTriggers } from "../events/eventConstants";
import { gameEvents } from "../events/Events";
import { gameState } from "../game/GameState";
import { Title } from "../game/Title";
import type { LevelConfiguration } from "../levels/configurationManager";

export const buildRetryOption = (config: LevelConfiguration) => {
  gameEvents.emit(soundTriggers.stopMusic);
  gameEvents.emit(signals.levelChanging, config);
  gameState.set(STATE_INITIAL);
}

export const quitGameOption = () => {
  gameState.set(STATE_TITLE);
  gameEvents.emit(signals.levelChanging, new Title())
}