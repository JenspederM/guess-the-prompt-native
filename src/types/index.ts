import {OriginalGameType} from '../games/original/types';
import {SimonsGameType} from '../games/simons/types';
import {StackListProps} from './routes';

export {type StackListProps};

export type ImageType = {
  type: 'url' | 'b64_json';
  image: string;
};

export type User = {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  isAnonymous: boolean;
  alias: string;
  theme: string;
  lastLogin?: string;
  createdAt?: string;
  cookieConsent: boolean;
};

export type Player = {
  id: string;
  name: string;
  photoURL?: string;
  score: number;
  isHost?: boolean;
  isReady?: boolean;
  isFinished?: boolean;
  isDisconnected?: boolean;
};

export type GameType = {
  id: string;
  gameStyle: string;
  description: string;
  roomCode: string;
  players: string[];
  host: string;
  createdAt: string;
  status: string;
  isStarted: boolean;
  isExpired: boolean;
};

export enum CustomGameStageEnum {
  STARTING = 'Starting',
  DRAWING = 'Drawing',
  GUESSING = 'Guessing',
  RANKING = 'Ranking',
  SUMMARY = 'Summary',
  FINISHED = 'Finished',
}

export type CustomGame = GameType & {
  gameStyle: 'custom';
  imagesPerPlayer: number;
  stage: CustomGameStageEnum;
};

export type Game = OriginalGameType | CustomGame | SimonsGameType;

export enum GameStyle {
  ORIGINAL = 'original',
  CUSTOM = 'custom',
  SIMONS = 'simons',
}
