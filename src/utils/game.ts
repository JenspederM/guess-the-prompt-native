import {
  CustomGame,
  Game,
  OriginalGame,
  Player,
  OriginalGameStageEnum,
  CustomGameStageEnum,
} from '../types';
import firestore from '@react-native-firebase/firestore';
import {firebaseGuid} from './firebase';
import randomWords from 'random-words';

export enum GameStatus {
  WaitingForPlayers = 'Waiting for players',
  WaitingForHost = 'Waiting for host',
  WaitingForPlayersToBeReady = 'Waiting for players to be ready',
  WaitingForPlayersToFinish = 'Waiting for players to finish',
  Finished = 'Finished',
}

type GetDefaultGameStyleProps = {
  style: string;
  host: string;
};

export const setGameStage = async (gameId: string, stage: string) => {
  await firestore().collection('games').doc(gameId).update({stage: stage});
};

export const getDefaultGameStyle = ({
  style,
  host,
}: GetDefaultGameStyleProps): Game => {
  let gameStyle: Partial<Game> = {
    id: firebaseGuid(),
    description: 'Original game style',
    roomCode: randomWords(1)[0],
    maxNumberOfPLayers: 6,
    players: [],
    host: host,
    createdAt: new Date().toISOString(),
    status: 'Waiting for players',
    isStarted: false,
    isExpired: false,
  };

  switch (style) {
    case 'original':
      gameStyle.gameStyle = 'original';
      gameStyle.imagesPerPlayer = 1;
      gameStyle.stage = OriginalGameStageEnum.STARTING;
      return gameStyle as OriginalGame;
    case 'custom':
      gameStyle.gameStyle = 'custom';
      gameStyle.imagesPerPlayer = 1;
      gameStyle.stage = CustomGameStageEnum.STARTING;
      gameStyle.description = 'Custom game style';
      return gameStyle as CustomGame;
    default:
      gameStyle.gameStyle = 'original';
      gameStyle.imagesPerPlayer = 1;
      return gameStyle as Game;
  }
};

type GetDefaultPlayerProps = {
  id: string;
  alias: string;
};

export const getDefaultPlayer = ({
  id,
  alias,
}: GetDefaultPlayerProps): Player => {
  return {
    id: id,
    name: alias,
    isHost: false,
    isReady: false,
    score: 0,
  };
};

export const leaveGame = async (
  gameId?: string,
  userId?: string,
  callback?: () => void,
) => {
  if (!gameId || !userId || !callback) {
    return;
  }
  // Count before deleting
  const nPlayers = await firestore()
    .collection('games')
    .doc(gameId)
    .collection('players')
    .count()
    .get();

  await firestore()
    .collection('games')
    .doc(gameId)
    .collection('players')
    .doc(userId)
    .delete();

  if (nPlayers.data().count - 1 <= 0) {
    // If no players left, delete game
    // -1 because we just deleted the player
    await firestore().collection('games').doc(gameId).update({isExpired: true});
  }

  callback();
};
