import {CustomGame, Game, Player, User, GameStyle} from '../types';
import firestore from '@react-native-firebase/firestore';
import {firebaseGuid} from './firebase';
import randomWords from 'random-words';
import {getLogger} from './logging';
import {OriginalGameStageEnum, OriginalGameType} from '../games/original/types';
import {SimonsGameStagesEnum, SimonsGameType} from '../games/simons/types';

export enum GameStatus {
  WaitingForPlayers = 'Waiting for players',
  WaitingForHost = 'Waiting for host',
  WaitingForPlayersToBeReady = 'Waiting for players to be ready',
  WaitingForPlayersToFinish = 'Waiting for players to finish',
  Finished = 'Finished',
}

const logger = getLogger('utils.game');

type GetDefaultGameStyleProps = {
  style: GameStyle;
  host: string;
};

export const setGameStage = async (gameId: string, stage: string) => {
  await firestore().collection('games').doc(gameId).update({stage: stage});
};

export const getDefaultGameStyle = ({
  style,
  host,
}: GetDefaultGameStyleProps): Game => {
  let gameSettings: Partial<Game> = {
    id: firebaseGuid(),
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
      return {
        ...gameSettings,
        gameStyle: 'original',
        description: 'Original game style',
        imagesPerPlayer: 1,
        stage: OriginalGameStageEnum.STARTING,
      } as OriginalGameType;
    case 'custom':
      return {
        ...gameSettings,
        gameStyle: 'custom',
        description: 'Custom game style',
        imagesPerPlayer: 1,
      } as CustomGame;
    case 'simons':
      return {
        ...gameSettings,
        gameStyle: 'simons',
        description: 'Simons game style',
        stage: SimonsGameStagesEnum.THEME,
        nRounds: 3,
      } as SimonsGameType;
  }

  return {
    ...gameSettings,
    gameStyle: 'original',
    description: 'Original game style',
    imagesPerPlayer: 1,
    stage: OriginalGameStageEnum.STARTING,
  } as OriginalGameType;
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

const getPossibleGames = async (roomCode: string, user: User) => {
  const _log = logger.getChildLogger('getPossibleGames');

  _log.debug('Validating room code...');
  const isGameWithRoomCode = firestore()
    .collection('games')
    .where('isStarted', '==', false)
    .where('isExpired', '==', false)
    .where('roomCode', '==', roomCode.trim().toLowerCase())
    .get();

  _log.debug('Validating if user is already in game...');
  const isGameWithPlayer = firestore()
    .collection('games')
    .where('isExpired', '==', false)
    .where('roomCode', '==', roomCode.trim().toLowerCase())
    .where('players', 'array-contains', user.id)
    .get();

  const [gamesWithRoomCodeSnap, gamesWithPlayerSnap] = await Promise.all([
    isGameWithRoomCode,
    isGameWithPlayer,
  ]);

  const gamesWithRoomCode = gamesWithRoomCodeSnap.docs;
  const gamesWithPlayer = gamesWithPlayerSnap.docs;

  const games = gamesWithRoomCode
    .concat(gamesWithPlayer)
    .map(doc => doc.data());

  const uniqueGames: Game[] = Object.values(
    games.reduce((acc, obj) => ({...acc, [obj.id]: obj}), {}),
  );

  return uniqueGames;
};

export const joinGame = async ({
  roomCode,
  user,
}: {
  roomCode: string;
  user: User;
}): Promise<{game?: Game; message?: string}> => {
  const _log = logger.getChildLogger('joinGame');
  const possibleGames = await getPossibleGames(roomCode, user);

  if (possibleGames.length === 0) {
    _log.debug('No game found with that room code', roomCode);
    return {message: 'No game found with that room code'};
  }

  if (possibleGames.length > 1) {
    _log.debug(
      'Multiple games found with that room code',
      roomCode,
      possibleGames,
    );
    return {
      message: 'Multiple games found with that room code',
    };
  }

  const game = possibleGames[0];

  _log.debug('Game found', {roomCode, game});

  _log.debug('Adding user to game players collection');
  const player: Player = {
    name: user.alias,
    id: user.id,
    isHost: false,
    isReady: false,
    score: 0,
  };

  _log.debug('Adding user to game');
  await firestore()
    .collection('games')
    .doc(game.id)
    .collection('players')
    .doc(user.id)
    .set(player);

  if (!game.players.includes(user.id)) {
    await firestore()
      .collection('games')
      .doc(game.id)
      .update({
        players: firestore.FieldValue.arrayUnion(user.id),
      });
  }

  return {game};
};

export const leaveGame = async (
  gameId?: string,
  userId?: string,
  callback?: () => void,
) => {
  if (!gameId || !userId || !callback) {
    return;
  }
  callback();

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
};
