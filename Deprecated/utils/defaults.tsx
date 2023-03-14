import {CustomGameType} from '../games/custom/types';
import {OriginalGameStageEnum, OriginalGameType} from '../games/original/types';
import {SimonsGameStagesEnum, SimonsGameType} from '../games/simons/types';
import {Game, GameStyle} from '../types';
import {firebaseGuid} from './firebaseGuid';
import randomWords from 'random-words';

type GetDefaultGameStyleProps = {
  style: GameStyle;
  host: string;
};

export const getDefaultGameStyle = ({
  style,
  host,
}: GetDefaultGameStyleProps): Game => {
  let gameSettings: Partial<Game> = {
    id: firebaseGuid(),
    roomCode: randomWords(1)[0],
    players: [],
    host: host,
    createdAt: new Date().toISOString(),
    isStarted: false,
    isExpired: false,
  };

  switch (style) {
    case 'original':
      return {
        ...gameSettings,
        gameStyle: 'original',
        description: 'Original game style',
        imagesPerPlayer: 1,
        stage: OriginalGameStageEnum.STARTING,
      } as OriginalGameType;
    case 'custom':
      return {
        ...gameSettings,
        gameStyle: 'custom',
        description: 'Custom game style',
        imagesPerPlayer: 1,
      } as CustomGameType;
    case 'simons':
      return {
        ...gameSettings,
        gameStyle: 'simons',
        description: 'Simons game style',
        stage: SimonsGameStagesEnum.THEME,
        numberOfRounds: 3,
      } as SimonsGameType;
  }

  return {
    ...gameSettings,
    gameStyle: 'original',
    description: 'Original game style',
    imagesPerPlayer: 1,
    stage: OriginalGameStageEnum.STARTING,
  } as OriginalGameType;
};
