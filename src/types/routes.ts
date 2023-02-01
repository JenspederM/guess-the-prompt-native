export type StackListProps = {
  Login: undefined;
  Home: undefined;
  Play: undefined;
  Host: {gameStyle: string};
  Lobby: {roomCode?: string; gameId: string};
  Game: {gameId: string};
  Debug: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends StackListProps {}
  }
}
