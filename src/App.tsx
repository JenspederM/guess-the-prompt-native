/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {useAuthChanged} from './utils/hooks';
import {StackListProps} from './types';

import Home from './pages/Home';
import Login from './pages/Login';
import Play from './pages/Play';
import Host from './pages/Host';
import Lobby from './pages/Lobby';
import GameScreen from './pages/Game';
import Debug from './pages/Debug';

const Stack = createNativeStackNavigator<StackListProps>();

function AppStack() {
  const user = useAuthChanged();

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {!user ? (
        <Stack.Screen name="Login" component={Login} />
      ) : (
        <>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Debug" component={Debug} />
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
