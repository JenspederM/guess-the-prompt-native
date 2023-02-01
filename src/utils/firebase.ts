import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import {Game, Player, User} from '../types';
import {getLogger} from './logging';
import {useEffect, useState} from 'react';
import {useAtom, useSetAtom} from 'jotai';
import {aliasAtom, themeAliasAtom, userAtom} from '../atoms';

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

export const useAuthChanged = () => {
  const _log = logger.getChildLogger('useAuthChanged');
  const [user, setUser] = useAtom(userAtom);
  const setAlias = useSetAtom(aliasAtom);
  const setThemeAlias = useSetAtom(themeAliasAtom);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(
      async (authUser: FirebaseAuthTypes.User | null) => {
        if (!authUser) {
          _log.debug('User is not logged in');
          setUser(null);
          return;
        }
        _log.debug('User is logged in', user);
        const newUser = await getUserFromAuth(authUser);
        setUser(newUser);
        setAlias(newUser.alias);
        setThemeAlias(newUser.theme);
      },
    );

    return () => {
      _log.debug('Unsubscribing from auth changed');
      unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return user;
};

export const useUser = (userId: string) => {
  const _log = logger.getChildLogger('useUser');
  const [user, setUser] = useState<User>();

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = firestore()
      .collection('users')
      .doc(userId)
      .onSnapshot(
        doc => {
          setUser(doc.data() as User);
          _log.debug('Got new user', doc.data());
        },
        e => _log.error('Error subscribing to user', e),
      );

    return () => {
      _log.debug('Unsubscribing from user');
      unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return user;
};

export const usePlayers = (gameId: string) => {
  const _log = logger.getChildLogger('usePlayers');
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (!gameId) return;
    const unsubscribe = firestore()
      .collection('games')
      .doc(gameId)
      .collection('players')
      .onSnapshot(
        snapshot => {
          const newPlayers: Player[] = [];
          snapshot.forEach(doc => {
            newPlayers.push(doc.data() as Player);
          });
          _log.debug('Got new players', newPlayers);
          setPlayers(newPlayers);
        },
        e => _log.error('Error subscribing to players', e),
      );

    return () => {
      _log.debug('Unsubscribing from players');
      unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return players;
};

export const useGame = (gameId: string) => {
  const _log = logger.getChildLogger('useGame');
  const [game, setGame] = useState<Game>();

  useEffect(() => {
    if (!gameId) return;
    const unsubscribe = firestore()
      .collection('games')
      .doc(gameId)
      .onSnapshot(
        doc => {
          setGame(doc.data() as Game);
          _log.debug('Got new game', doc.data());
        },
        e => _log.error('Error subscribing to game', e),
      );

    return () => {
      _log.debug('Unsubscribing from game');
      unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return game;
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
