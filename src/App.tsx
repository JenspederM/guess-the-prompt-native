import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import {
  Provider as PaperProvider,
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';

import {StackListProps} from './types';
import Home from './pages/Home';
import Login from './pages/Login';
import Play from './pages/Play';
import Host from './pages/Host';
import GameScreen from './pages/Game';
import {Appearance} from 'react-native';
import {useUser} from './AuthProvider';

const Stack = createNativeStackNavigator<StackListProps>();

const {LightTheme, DarkTheme} = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedDefaultTheme = {
  ...MD3LightTheme,
  ...LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
  },
};

const CombinedDarkTheme = {
  ...MD3DarkTheme,
  ...DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...DarkTheme.colors,
  },
};

function App(): JSX.Element {
  // Set an initializing state whilst Firebase connects
  const [theme, setTheme] = useState(CombinedDefaultTheme);
  const user = useUser();

  useEffect(() => {
    const unsub = Appearance.addChangeListener(({colorScheme}) => {
      switch (colorScheme) {
        case 'dark':
          setTheme(CombinedDarkTheme);
          break;
        default:
          setTheme(CombinedDefaultTheme);
      }
    });

    return () => {
      unsub.remove();
    };
  }, []);

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={theme}>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {!user ? (
            <Stack.Screen name="Login" component={Login} />
          ) : (
            <>
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="Play" component={Play} />
              <Stack.Screen name="Host" component={Host} />
              <Stack.Screen name="Game" component={GameScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default App;
