export type StackListProps = {
  Host: {gameStyle: string};
  Profile: undefined;
  Login: undefined;
  Home: undefined;
  Play: undefined;
  Lobby: {roomCode?: string; gameId: string};
  Game: {gameId: string};
  Settings: undefined;
  Notifications: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends StackListProps {}
  }
}
