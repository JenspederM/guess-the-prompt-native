import {useEffect, useState} from 'react';
import {useAtom, useSetAtom} from 'jotai';
import {getLogger} from './logging';
import {
  aliasAtom,
  snackAtom,
  themeAliasAtom,
  userAtom,
  snackVisibleAtom,
} from '../atoms';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {getUserFromAuth} from './firebase';
import {Game, Player, User} from '../types';
import firestore from '@react-native-firebase/firestore';

const logger = getLogger('utils.hooks');

export const useOnMount = (callback: () => void) => {
  useEffect(() => {
    callback();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};

export const useSetSnack = () => {
  const setSnack = useSetAtom(snackAtom);
  const setSnackVisible = useSetAtom(snackVisibleAtom);

  const _setSnack = (message: string) => {
    setSnack(message);
    setSnackVisible(true);

    setTimeout(() => {
      setSnackVisible(false);
      setSnack('');
    }, 3000);
  };

  return _setSnack;
};

export const useUser = (
  location: string,
): {
  isLoading: boolean;
  data: User | null;
} => {
  const [user, setUser] = useAtom(userAtom);
  const [isLoading, setIsLoading] = useState(true);
  const _log = getLogger(`${location}.useAuthUser`);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(
      (authUser: FirebaseAuthTypes.User | null) => {
        if (!authUser || !authUser.uid) {
          setUser(null);
          return;
        }

        const ref = firestore().collection('users').doc(authUser.uid);

        ref.get().then(doc => {
          if (doc.exists) {
            _log.debug('User exists', doc.data());
            const userData = doc.data();
            ref.update({
              lastLogin: authUser.metadata.lastSignInTime,
            });
            setUser(userData as User);
            setIsLoading(false);
          } else {
            _log.debug('User does not exist');
            ref.set({
              id: authUser.uid,
              email: authUser.email || '',
              displayName: authUser.displayName || '',
              photoURL: authUser.photoURL || '',
              isAnonymous: authUser.isAnonymous,
              cookieConsent: false,
              theme: 'light',
              alias: '',
              lastLogin: authUser.metadata.lastSignInTime,
              createdAt: authUser.metadata.creationTime,
            });
          }
        });
      },
    );

    return () => {
      _log.debug('Unsubscribing from auth state changes');
      unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {isLoading, data: user};
};

export const useAuthChanged = (location: string): User | null => {
  const _log = logger.getChildLogger(`${location}.useAuthChanged()`);
  const [user, setUser] = useAtom(userAtom);
  const setAlias = useSetAtom(aliasAtom);
  const setThemeAlias = useSetAtom(themeAliasAtom);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(
      async (authUser: FirebaseAuthTypes.User | null) => {
        if (!authUser || !authUser.uid) {
          _log.debug('User is not logged in');
          setUser(null);
          return;
        }
        _log.debug('User is logged in', authUser);
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

export const usePlayers = (gameId: string): Player[] => {
  const _log = logger.getChildLogger('usePlayers');
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (!gameId) {
      _log.debug('No game id');
      return;
    }
    const unsubscribe = firestore()
      .collection('games')
      .doc(gameId)
      .collection('players')
      .onSnapshot(
        snapshot => {
          if (!snapshot.empty) {
            const newPlayers: Player[] = [];
            snapshot.forEach(doc => {
              newPlayers.push(doc.data() as Player);
            });
            _log.debug('Got new players', newPlayers);
            setPlayers(newPlayers);
          }
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

export const useGame = (gameId: string): Game | undefined => {
  const _log = logger.getChildLogger('useGame');
  const [game, setGame] = useState<Game>();

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('games')
      .doc(gameId)
      .onSnapshot(doc => {
        if (doc && !doc.exists) {
          logger.debug('Game does not exist');
          return;
        }
        const currentGame = doc.data() as Game;
        logger.info('Game changed', currentGame);

        if (currentGame.isExpired) {
          logger.debug('Game is expired');
          return;
        }

        if (currentGame) {
          setGame(currentGame);
        }
      });

    return () => {
      _log.debug('Unsubscribing from game');
      unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return game;
};
