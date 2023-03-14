import {Game} from '../types';

export const firebaseGuid = (length: number = 28) => {
  console.debug('Generating a new firebase guid');

  const CHARS =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let autoId = '';

  for (let i = 0; i < length; i++) {
    autoId += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }

  return autoId;
};

export function findScenarioSetterId(game: Game, startingPoint: number = 0) {
  const playerIds = Object.keys(game.players);
  const startIndex = startingPoint + game.round;
  const setterIndex = startIndex % playerIds.length;
  return playerIds[setterIndex];
}
