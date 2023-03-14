import firestore from '@react-native-firebase/firestore';
import {useEffect, useState} from 'react';

export type Game = {
  id: string;
  host: string;
  players: string[];
  round: number;
  type: string;
  createdAt: string;
  isStarted: boolean;
  isExpired: boolean;
};

export type Image = {
  id: string;
  round: number;
  createdBy: string;
  type: 'url' | 'b64_json';
  uri: string;
};

export type Vote = {
  id: string;
  image: string;
  player: string;
  round: number;
};

export type SimonsRound = {
  id: number;
  theme: string;
  themeSelector: string;
  votes: string[];
  images: string[];
  bestImage: string;
  roundTheme: string[];
  roundDraw: string[];
  roundVote: string[];
  roundResults: string[];
};

export type Player = {
  id: string;
  name: string;
  score: number;
};

export type User = {
  id: string;
  alias: string;
  theme: string;
};

const gameCollection = firestore().collection('games');

export async function createGame(host: User) {
  const game: Game = {
    id: gameCollection.doc().id,
    type: 'simons',
    host: host.id,
    players: [host.id],
    round: 0,
    createdAt: new Date().toISOString(),
    isExpired: false,
    isStarted: false,
  };

  await gameCollection.doc(game.id).set(game);

  const playerCollection = gameCollection.doc(game.id).collection('players');
  const player: Player = {
    id: host.id,
    name: host.alias,
    score: 0,
  };

  await playerCollection.doc(player.id).set(player);

  return game;
}

export async function setThemeSelector(gameId: string) {
  const game = await getGame(gameId);

  const roundsSnap = await gameCollection
    .doc(gameId)
    .collection('rounds')
    .get();

  const previousSelectors = roundsSnap.docs.reduce((acc, doc) => {
    const round = doc.data() as SimonsRound;
    if (round.themeSelector) {
      acc.push(round.themeSelector);
    }
    return acc;
  }, [] as string[]);

  const playerSnap = await gameCollection
    .doc(gameId)
    .collection('players')
    .get();

  const playerIds = playerSnap.docs.map(doc => doc.data().id);

  const availablePlayers = playerIds.filter(
    id => !previousSelectors.includes(id),
  );

  // If all players have been theme selectors, reset the list
  if (availablePlayers.length === 0) {
    availablePlayers.push(...playerIds);
  }

  const themeSelector = availablePlayers.pop();

  await gameCollection
    .doc(gameId)
    .collection('rounds')
    .doc(game.round.toString())
    .update({
      themeSelector,
    });
}

export function useCurrentRound(gameId: string): {
  game: Game | undefined;
  round: SimonsRound | undefined;
} {
  const [game, setGame] = useState<Game | undefined>(undefined);
  const [round, setRound] = useState<SimonsRound | undefined>(undefined);

  useEffect(() => {
    const unsubscribeGame = gameCollection.doc(gameId).onSnapshot(doc => {
      setGame(doc.data() as Game);
    });

    const unsubscribeRound = gameCollection
      .doc(gameId)
      .collection('rounds')
      .doc((game?.round || 0).toString())
      .onSnapshot(doc => {
        setRound(doc.data() as SimonsRound);
      });

    return () => {
      unsubscribeGame();
      unsubscribeRound();
    };
  }, [gameId, game]);

  return {game, round};
}

export function useGame(gameId: string) {
  const [game, setGame] = useState<Game | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = gameCollection.doc(gameId).onSnapshot(doc => {
      setGame(doc.data() as Game);
    });

    return () => {
      unsubscribe();
    };
  }, [gameId]);

  return game;
}

export async function getGame(gameId: string) {
  const game = await gameCollection.doc(gameId).get();
  return game.data() as Game;
}

export async function startRound(gameId: string) {
  const game = await getGame(gameId);
  const roundId = game.round + 1;

  gameCollection.doc(gameId).update({
    round: roundId,
  });

  const round: SimonsRound = {
    id: roundId,
    theme: '',
    themeSelector: '',
    votes: [],
    images: [],
    bestImage: '',
    roundTheme: [],
    roundDraw: [],
    roundVote: [],
    roundResults: [],
  };

  const roundCollection = gameCollection.doc(gameId).collection('rounds');
  await roundCollection.doc(round.id.toString()).set(round);

  return round;
}

export async function getRound(gameId: string, roundId: number) {
  const roundCollection = gameCollection.doc(gameId).collection('rounds');
  const round = await roundCollection.doc(roundId.toString()).get();
  return round.data() as SimonsRound;
}
