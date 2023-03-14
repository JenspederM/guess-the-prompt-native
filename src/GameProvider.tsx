import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {Game, Player, Round} from './types';

type GameContextType = {
  isLoading: boolean;
  game: Game;
  players: Player[];
  currentRound?: Round;
};

const GameContext = React.createContext<GameContextType | null>(null);

const GameProvider = (props: React.PropsWithChildren<{gameId: string}>) => {
  const [game, setGame] = useState<Game | null>(null);
  const [currentRound, setCurrentRound] = useState<Round | undefined>();

  useEffect(() => {
    const unsubGame = firestore()
      .collection('games')
      .doc(props.gameId)
      .onSnapshot(snapshot => {
        setGame(snapshot.data() as Game);
      });

    return unsubGame;
  }, [props.gameId]);

  useEffect(() => {
    if (!game) return;

    const unsubRound = firestore()
      .collection('games')
      .doc(props.gameId)
      .collection('rounds')
      .doc(game.round.toString())
      .onSnapshot(snapshot => {
        setCurrentRound(snapshot.data() as Round);
      });

    return unsubRound;
  }, [props.gameId, game]);

  const context = !game
    ? null
    : {
        isLoading: !game || !currentRound,
        game,
        players: Object.values(game.players).sort((a, b) => {
          if (a.id === game.host) return -1;
          else if (a.id < b.id) return -1;
          else return 1;
        }),
        currentRound,
      };

  return (
    <GameContext.Provider value={context}>
      {props.children}
    </GameContext.Provider>
  );
};

export const useGame = () => React.useContext(GameContext);
export default GameProvider;
