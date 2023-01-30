import {CustomGame, GameStyle, OriginalGame, Player} from '../types';
import {firebaseGuid} from './firebase';
import randomWords from 'random-words';

type GetDefaultGameStyleProps = {
  style: string;
  host: string;
};

export const getDefaultGameStyle = ({
  style,
  host,
}: GetDefaultGameStyleProps): GameStyle => {
  let gameStyle: Partial<GameStyle> = {
    id: firebaseGuid(),
    description: 'Original game style',
    roomCode: randomWords(1)[0],
    maxNumberOfPLayers: 6,
    players: [],
    host: host,
    createdAt: new Date().toISOString(),
    status: 'Waiting for players',
    isStarted: false,
    isExpired: false,
  };

  switch (style) {
    case 'original':
      gameStyle.gameStyle = 'original';
      gameStyle.imagesPerPlayer = 1;
      return gameStyle as OriginalGame;
    case 'custom':
      gameStyle.gameStyle = 'custom';
      gameStyle.imagesPerPlayer = 1;
      gameStyle.description = 'Custom game style';
      return gameStyle as CustomGame;
    default:
      gameStyle.gameStyle = 'original';
      gameStyle.imagesPerPlayer = 1;
      return gameStyle as GameStyle;
  }
};

type GetDefaultPlayerProps = {
  id: string;
  alias: string;
};

export const getDefaultPlayer = ({
  id,
  alias,
}: GetDefaultPlayerProps): Player => {
  return {
    id: id,
    name: alias,
    isHost: false,
    isReady: false,
    score: 0,
  };
};
