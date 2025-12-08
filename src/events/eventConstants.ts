export const signals = {
  slimePosition: 'SLIME_POSITION',
  slimeItemCollect: 'SLIME_COLLECTS_ITEM',
  slimeInteraction: 'SLIME_INTERACTION',
  slimeContact: 'SLIME_CONTACT',
  sceneExit: 'SCENE_EXIT',
  levelChanging: 'LEVEL_CHANGING',
  levelChanged: 'LEVEL_CHANGED',
  stateChanged: 'GAME_STATE_CHANGE',
  scoreUpdate: 'SCORE_CHANGE',
  startTextInteraction: 'START_TEXT_INTERACTION',
  endTextInteraction: 'END_TEXT_INTERACTION',
  arrowMovement: 'ARROW_MOVEMENT',
  arrowStep: 'ARROW_MOVEMENT_SINGLE',
  gameAction: 'GAME_ACTION',
  toggleMusic: 'TOGGLE_MUSIC',
  toggleSound: 'TOGGLE_SOUND',
};

export const soundTriggers = {
  playFruit: 'PLAY_FRUIT_COLLECT',
  playPaddle: 'PLAY_PADDLE',
  playCrashDeath: 'PLAY_DEATH',
  playExpirationDeath: 'PLAY_EXPIRED',
  playMoveCursor: 'PLAY_SELECTION',
  playSelectionConfirmed: 'PLAY_CONFIRMATION',
  stopMusic: 'STOP_MUSIC',
}