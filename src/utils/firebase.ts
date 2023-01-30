import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import {User} from '../types';
import {getLogger} from './logging';

const logger = getLogger('utils');

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

export const getUserFromAuth = async (
  user: FirebaseAuthTypes.User,
): Promise<User> => {
  const _log = logger.m('getUserFromAuth');
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
