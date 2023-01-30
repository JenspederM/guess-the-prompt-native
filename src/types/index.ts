export type StackListProps = {
  Host: {gameStyle: string};
  Profile: undefined;
  Login: undefined;
  Home: undefined;
  Play: undefined;
  Lobby: {roomCode?: string; gameId: string};
  Game: {roomCode?: string; gameId: string};
  Settings: undefined;
  Notifications: undefined;
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

export type Game = {
  id: string;
  gameStyle: string;
  description: string;
  roomCode: string;
  maxNumberOfPLayers: number;
  players: string[];
  host: string;
  createdAt: string;
  status: string;
  isStarted: boolean;
  isExpired: boolean;
};

export type OriginalGame = Game & {
  gameStyle: 'original';
  imagesPerPlayer: number;
};

export type CustomGame = Game & {
  gameStyle: 'custom';
  imagesPerPlayer: number;
};

export type GameStyle = OriginalGame | CustomGame;
