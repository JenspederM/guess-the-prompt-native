import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import {PromptedImage, User} from '../types';
import {getLogger} from './logging';

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

export const generateImageFromPrompt = async (
  label: string,
  prompt: string,
): Promise<PromptedImage> => {
  const _log = logger.getChildLogger('generateImageFromPrompt');
  _log.debug('Generating image from prompt', prompt);

  const generationResponse = {
    type: 'debug',
    uri: '',
  };

  const guid = firebaseGuid();

  switch (generationResponse.type) {
    case 'url':
      return {
        label: label,
        value: guid,
        type: 'url',
        prompt: prompt,
        uri: generationResponse.uri,
      };
    case 'b64_json':
      return {
        label: label,
        value: guid,
        type: 'b64_json',
        prompt: prompt,
        uri: `data:image/png;base64,${generationResponse.uri}`,
      };
    default:
      const index = Math.floor(Math.random() * 100);
      _log.debug('Image type not supported. Using picsum at index', index);
      return {
        label: label,
        value: guid,
        type: 'url',
        prompt: prompt,
        uri: `https://picsum.photos/id/${index}/256/256`,
      };
  }
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

  await firestore()
    .collection('games')
    .doc(gameId)
    .collection('players')
    .doc(userId)
    .update({isReady: ready})
    .catch(e => {
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
    const newUser = {
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
