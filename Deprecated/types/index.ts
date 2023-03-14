import {CustomGameType} from '../games/custom/types';
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
  alias: string;
  email: string;
  theme: string;
  displayName: string;
  isAnonymous: boolean;
  cookieConsent: boolean;
  lastLogin?: string;
  createdAt?: string;
};

export type Player = {
  id: string;
  name: string;
  score: number;
};

export type Round = {
  id: number;
  images: ImageType[];
  readyPlayers: string[];
};

export type GameType = {
  id: string;
  roomCode: string;
  gameStyle: string;
  description: string;
  players: string[];
  host: string;
  createdAt: string;
  isStarted: boolean;
  isExpired: boolean;
};

export type Game = OriginalGameType | CustomGameType | SimonsGameType;

export enum GameStyle {
  ORIGINAL = 'original',
  CUSTOM = 'custom',
  SIMONS = 'simons',
}
