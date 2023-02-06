import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import {Game, User} from '../types';
import {getLogger} from './logging';
import {getDefaultPlayer} from './game';

const logger = getLogger('utils.firebase');

export const firebaseGuid = () => {
  logger.m('firebaseGuid').debug('Generating a new firebase guid');

  const CHARS =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let autoId = '';

  for (let i = 0; i < 28; i++) {
    autoId += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }

  return autoId;
};

export const setUserTheme = async (user: User, theme: string) => {
  const _log = logger.m('setUserTheme');
  _log.debug(`Changing user theme from '${user.theme}' to '${theme}'`);
  const userCollection = firestore().collection('users');

  await userCollection
    .doc(user.id)
    .update({theme})
    .catch(e => {
      _log.error('Error updating theme', e);
    });
};

export const setUserAlias = async (user: User, alias: string) => {
  const _log = logger.m('setUserAlias');
  _log.debug(`Changing user alias from '${user.alias}' to '${alias}'`);
  const userCollection = firestore().collection('users');

  await userCollection
    .doc(user.id)
    .update({alias})
    .catch(e => {
      _log.error('Error updating alias', e);
    });
};

export const setPlayerReadiness = async (
  gameId: string,
  userId: string,
  ready: boolean,
) => {
  let isFailed = false;
  const player = firestore()
    .collection('games')
    .doc(gameId)
    .collection('players')
    .doc(userId);

  await player.update({isReady: ready}).catch(e => {
    logger
      .m('setPlayerReadiness')
      .error('Error updating player readiness', e, {gameId, userId, ready});
    isFailed = true;
  });

  return !isFailed;
};

export const getUserFromAuth = async (
  user: FirebaseAuthTypes.User,
): Promise<User> => {
  const _log = logger.getChildLogger('getUserFromAuth');
  _log.debug('Getting user from auth', user);
  const userCollection = firestore().collection('users');

  const userDoc = await userCollection
    .doc(user.uid)
    .get()
    .then(doc => {
      _log.debug('Got user doc', doc);
      return doc;
    })
    .catch(e => {
      _log.error('Error getting user', e);
    });

  _log.debug('User doc', userDoc);

  if (userDoc && userDoc.exists) {
    _log.debug('User exists, updating lastLogin');
    await userCollection
      .doc(user.uid)
      .update({lastLogin: user.metadata.lastSignInTime})
      .catch(e => {
        _log.error('Error updating lastLogin', e);
      });

    return userDoc.data() as User;
  } else {
    _log.debug('Creating new user');
    const newUser: User = {
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      isAnonymous: user.isAnonymous,
      cookieConsent: false,
      theme: 'light',
      alias: '',
      lastLogin: user.metadata.lastSignInTime,
      createdAt: user.metadata.creationTime,
    };

    await userCollection
      .doc(user.uid)
      .set(newUser)
      .catch(e => {
        _log.error('Error creating new user', e);
      });

    return newUser;
  }
};

export const createGame = async (gameSettings: Game, user: User) => {
  logger.m('onCreateGame').debug('Creating game', gameSettings);
  await firestore().collection('games').doc(gameSettings.id).set(gameSettings);

  const player = getDefaultPlayer({id: user.id, alias: user.alias});
  player.isHost = true;

  logger.m('onCreateGame').debug('Joining newly created game', player);
  await firestore()
    .collection('games')
    .doc(gameSettings.id)
    .collection('players')
    .doc(player.id)
    .set(player);

  await firestore()
    .collection('games')
    .doc(gameSettings.id)
    .update({
      players: firestore.FieldValue.arrayUnion(player.id),
    });
};
