import {User, GameStyle} from '../types';
import firestore from '@react-native-firebase/firestore';
import {firebaseGuid} from './firebaseGuid';
import {getLogger} from './logging';

type Game = {
  id: string;
  roomCode: string;
  style: string;
  description: string;
  players: string[];
  host: string;
  currentRound: number;
  createdAt: string;
  isStarted: boolean;
  isExpired: boolean;
};
type Player = {
  id: string;
  name: string;
  score: number;
};

type Round = {
  id: number;
  images: string[];
  readyPlayers: string[];
  theme: string;
  creator: string;
};

class RoundObj implements Round {
  id: number;
  images: string[];
  theme: string;
  creator: string;
  readyPlayers: string[];

  constructor({id, images, readyPlayers, theme, creator}: Round) {
    this.id = id;
    this.images = images;
    this.theme = theme;
    this.creator = creator;
    this.readyPlayers = readyPlayers;
  }

  static async create({gameId}: {gameId: string}) {
    const game = (await GameObj.get({id: gameId})) as Game;

    const round = {
      id: game.currentRound + 1,
      images: [],
      theme: '',
      creator: '',
      readyPlayers: [],
    };

    const roundCollection = firestore()
      .collection('games')
      .doc(gameId)
      .collection('rounds');

    await roundCollection.doc(round.id.toString(10)).set(round);

    return round;
  }

  static async get({gameId, id}: {gameId: string; id: string}) {
    const round = await firestore()
      .collection('games')
      .doc(gameId)
      .collection('rounds')
      .doc(id)
      .get();

    return round.data();
  }

  static async update({
    gameId,
    id,
    data,
  }: {
    gameId: string;
    id: string;
    data: Partial<Round>;
  }) {
    await firestore()
      .collection('games')
      .doc(gameId)
      .collection('rounds')
      .doc(id)
      .update(data);
  }

  static async delete({gameId, id}: {gameId: string; id: string}) {
    await firestore()
      .collection('games')
      .doc(gameId)
      .collection('rounds')
      .doc(id)
      .delete();
  }
}

class GameObj implements Game {
  id: string;
  roomCode: string;
  style: string;
  description: string;
  players: string[];
  host: string;
  currentRound: number;
  createdAt: string;
  isStarted: boolean;
  isExpired: boolean;

  constructor({
    id,
    roomCode,
    style,
    description,
    players,
    host,
    currentRound,
    createdAt,
    isStarted,
    isExpired,
  }: Game) {
    this.id = id;
    this.host = host;
    this.style = style;
    this.players = players;
    this.roomCode = roomCode;
    this.description = description;
    this.currentRound = currentRound;
    this.createdAt = createdAt;
    this.isStarted = isStarted;
    this.isExpired = isExpired;
  }

  static async create({user}: {user: User}) {
    const game = {
      id: firebaseGuid(),
      roomCode: '',
      style: GameStyle.ORIGINAL,
      description: '',
      players: [user.id],
      host: user.id,
      currentRound: 0,
      createdAt: new Date().toISOString(),
      isStarted: false,
      isExpired: false,
    };

    await firestore().collection('games').doc(game.id).set(game);

    return game;
  }

  static async get({id}: {id: string}) {
    const game = await firestore().collection('games').doc(id).get();

    return game.data();
  }

  static async update({id, data}: {id: string; data: Partial<Game>}) {
    await firestore().collection('games').doc(id).update(data);
  }

  static async delete({id}: {id: string}) {
    await firestore().collection('games').doc(id).delete();
  }

  static async addPlayer({gameId, user}: {gameId: string; user: User}) {
    const game = await this.get({id: gameId});

    if (!game) {
      logger.error('Game not found');
      return;
    }

    if (game.players.includes(user.id)) {
      logger.error('User already in game');
      return;
    }

    await this.update({
      id: gameId,
      data: {
        players: [...game.players, user.id],
      },
    });
  }

  static async removePlayer({gameId, user}: {gameId: string; user: User}) {
    const game = await this.get({id: gameId});

    if (!game) {
      logger.error('Game not found');
      return;
    }

    if (!game.players.includes(user.id)) {
      logger.error('User not in game');
      return;
    }

    await this.update({
      id: gameId,
      data: {
        players: game.players.filter(
          (playerId: string) => playerId !== user.id,
        ),
      },
    });
  }

  static async startGame({gameId}: {gameId: string}) {
    const game = await this.get({id: gameId});

    if (!game) {
      logger.error('Game not found');
      return;
    }

    await this.update({
      id: gameId,
      data: {
        isStarted: true,
      },
    });
  }

  static async endGame({gameId}: {gameId: string}) {
    const game = await this.get({id: gameId});

    if (!game) {
      logger.error('Game not found');
      return;
    }

    await this.update({
      id: gameId,
      data: {
        isExpired: true,
      },
    });
  }

  static async incrementRound({gameId}: {gameId: string}) {
    const game = await this.get({id: gameId});

    if (!game) {
      logger.error('Game not found');
      return;
    }

    await this.update({
      id: gameId,
      data: {
        currentRound: game.currentRound + 1,
      },
    });
  }

  static async decrementRound({gameId}: {gameId: string}) {
    const game = await this.get({id: gameId});

    if (!game) {
      logger.error('Game not found');
      return;
    }

    await this.update({
      id: gameId,
      data: {
        currentRound: game.currentRound - 1,
      },
    });
  }

  static async setRoomCode({
    gameId,
    roomCode,
  }: {
    gameId: string;
    roomCode: string;
  }) {
    const game = await this.get({id: gameId});

    if (!game) {
      logger.error('Game not found');
      return;
    }

    await this.update({
      id: gameId,
      data: {
        roomCode,
      },
    });
  }

  static async setStyle({gameId, style}: {gameId: string; style: GameStyle}) {
    const game = await this.get({id: gameId});

    if (!game) {
      logger.error('Game not found');
      return;
    }

    await this.update({
      id: gameId,
      data: {
        style,
      },
    });
  }

  static async startRound({gameId}: {gameId: string}) {
    const game = await this.get({id: gameId});

    if (!game) {
      logger.error('Game not found');
      return;
    }

    if (!game.roomCode) {
      logger.error('Game room code not set');
      return;
    }

    await this.incrementRound({gameId});

    await RoundObj.create({gameId});

    await this.update({
      id: gameId,
      data: {
        isExpired: false,
      },
    });
  }
}

export class PlayerObj {
  id: string;
  name: string;
  score: number;

  constructor({id, name, score}: Player) {
    this.id = id;
    this.name = name;
    this.score = score;
  }

  static async get({id}: {id: string}) {
    const player = await firestore().collection('players').doc(id).get();

    return player.data();
  }

  static async update({id, data}: {id: string; data: Partial<Player>}) {
    await firestore().collection('players').doc(id).update(data);
  }

  static async delete({id}: {id: string}) {
    await firestore().collection('players').doc(id).delete();
  }

  static async create({user}: {user: User}) {
    const player = {
      id: user.id,
      name: user.alias,
      score: 0,
    };

    await firestore().collection('players').doc(player.id).set(player);

    return player;
  }

  static async incrementScore({id, amount = 1}: {id: string; amount: number}) {
    const player = await this.get({id});

    if (!player) {
      logger.error('Player not found');
      return;
    }

    await this.update({
      id,
      data: {
        score: player.score + amount,
      },
    });
  }

  static async decrementScore({id, amount = 1}: {id: string; amount: number}) {
    const player = await this.get({id});

    if (!player) {
      logger.error('Player not found');
      return;
    }

    await this.update({
      id,
      data: {
        score: player.score - amount,
      },
    });
  }

  static async joinGame({gameId, user}: {gameId: string; user: User}) {
    const player = await this.get({id: user.id});

    if (!player) {
      logger.error('Player not found');
      return;
    }

    await GameObj.addPlayer({gameId, user});
  }

  static async leaveGame({gameId, user}: {gameId: string; user: User}) {
    const player = await this.get({id: user.id});

    if (!player) {
      logger.error('Player not found');
      return;
    }

    await GameObj.removePlayer({gameId, user});
  }
}

export default GameObj;

const logger = getLogger('utils.game');

export const setGameStage = async (gameId: string, stage: string) => {
  await firestore().collection('games').doc(gameId).update({stage: stage});
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
