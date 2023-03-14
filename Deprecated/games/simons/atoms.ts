import {atom} from 'jotai';
import {PromptedImage} from '../original/types';
import {Player} from '../../types';
import {Round, SimonsGameStagesEnum} from './types';
import {firebaseGuid} from '../../utils/firebase';

export const DEFAULT_ROUND: Round = {
  id: firebaseGuid(),
  theme: '',
  themeSelector: '',
  isFinished: false,
  bestImage: '',
};

export const DEFAULT_PLAYERS = [
  {
    id: 'host',
    name: 'Host',
    score: 5,
    isHost: true,
    isReady: false,
  },
  {
    id: 'player1',
    name: 'Player 1',
    score: 35,
    isHost: false,
    isReady: false,
  },
  {
    id: 'player2',
    name: 'Player 2',
    score: 25,
    isHost: false,
    isReady: false,
  },
];

export const DEFAULT_PLAYER_IDS = DEFAULT_PLAYERS.map(player => player.id);

export const ThemeAtom = atom<string>('');
export const RoundAtom = atom<Round>(DEFAULT_ROUND);
export const ImagesAtom = atom<PromptedImage[]>([]);
export const PlayersAtom = atom<Player[]>(DEFAULT_PLAYERS);
export const GameStageAtom = atom<SimonsGameStagesEnum>(
  SimonsGameStagesEnum.THEME,
);
