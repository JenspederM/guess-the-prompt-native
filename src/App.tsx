/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import Home from './pages/Home';
import Login from './pages/Login';
import {getLogger} from './utils';
import {getUserFromAuth} from './utils/firebase';
import {themeAliasAtom, userAtom, aliasAtom} from './atoms';
import {useAtom, useSetAtom} from 'jotai';
import {StackListProps, User} from './types';
import Play from './pages/Play';
import Host from './pages/Host';
import Lobby from './pages/Lobby';
import GameScreen from './pages/Game';
import Debug from './pages/Debug';

const Stack = createNativeStackNavigator<StackListProps>();

function AppStack() {
  const [user, setUser] = useAtom(userAtom);
  const setAlias = useSetAtom(aliasAtom);
  const setThemeAlias = useSetAtom(themeAliasAtom);
  const logger = getLogger('AppStack');

  useEffect(() => {
    logger.m('useEffect').debug('App started');

    const subscribtions: {[key: string]: () => void} = {
      auth: () => {},
      user: () => {},
    };

    // Handle user state changes
    subscribtions.auth = auth().onAuthStateChanged(
      (authUser: FirebaseAuthTypes.User | null) => {
        if (authUser) {
          logger.m('onAuthStateChanged').debug('User logged in');
          getUserFromAuth(authUser)
            .then(currentUser => {
              if (subscribtions.user) {
                subscribtions.user();
              }

              const unsubscribeUser = firestore()
                .collection('users')
                .doc(currentUser.id)
                .onSnapshot(
                  (userSnap: FirebaseFirestoreTypes.DocumentSnapshot) => {
                    if (!userSnap) return;
                    const userData = userSnap.data() as User;
                    logger.m('onUserChanged').debug('User updated', userData);
                    setUser(userData);
                    setAlias(userData.alias);
                  },
                );

              subscribtions.user = unsubscribeUser;
              setUser(currentUser);
              setThemeAlias(currentUser.theme);
            })
            .catch(error => {
              logger.error(error);
            });
        } else {
          logger.m('onAuthStateChanged').debug('User logged out');
          setUser(null);
        }
      },
    );

    return () => {
      logger.m('useEffect').debug('App stopped');
      Object.keys(subscribtions).forEach(key => {
        subscribtions[key]();
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {!user ? (
        <Stack.Screen name="Login" component={Login} />
      ) : (
        <>
          <Stack.Screen name="Debug" component={Debug} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Play" component={Play} />
          <Stack.Screen name="Host" component={Host} />
          <Stack.Screen name="Lobby" component={Lobby} />
          <Stack.Screen name="Game" component={GameScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

function App(): JSX.Element {
  return <AppStack />;
}

export default App;
