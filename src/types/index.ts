export type StackListProps = {
  Login: undefined;
  Home: undefined;
  Play: undefined;
  Host: undefined;
  Lobby: {gameId: string};
  Game: {gameId: string};
  Debug: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends StackListProps {}
  }
}

export type User = {
  id: string;
  name: string;
};

export type Game = {
  id: string;
  host: string;
  roomCode: string;
  type: string;
  players: {[key: string]: Player};
  round: number;
  isStarted: boolean;
  isFinished: boolean;
  createdAt: string;
  rating: number[];
  comments: string[];
};

export type Player = {
  id: string;
  name: string;
  score: number;
};

export type Round = {
  id: number;
  scenario: string;
  images: string[];
  bestImage: string;
};

export type PromptedImage = {
  id: string;
  type: string;
  uri: string;
  createdBy: string;
  prompt: string;
};
