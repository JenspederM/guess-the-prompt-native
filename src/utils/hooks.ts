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

export const useAuthChanged = (): User | null => {
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

export const useUser = (userId: string): User | undefined => {
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

export const usePlayers = (gameId: string): Player[] => {
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
