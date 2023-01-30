import * as React from 'react';
import {AppRegistry} from 'react-native';
import {
  Provider as PaperProvider,
  adaptNavigationTheme,
} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';
import {name as appName} from './app.json';
import App from './src/App';

import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import {MD3DarkTheme, MD3LightTheme} from 'react-native-paper';
import merge from 'deepmerge';
import {useAtomValue} from 'jotai';
import {themeAliasAtom} from './src/atoms';

const {LightTheme, DarkTheme} = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedDefaultTheme = merge(MD3LightTheme, LightTheme);
const CombinedDarkTheme = merge(MD3DarkTheme, DarkTheme);

export default function Main() {
  const [theme, setTheme] = React.useState(CombinedDefaultTheme);
  const themeAlias = useAtomValue(themeAliasAtom);

  React.useEffect(() => {
    if (themeAlias === 'light') {
      setTheme(CombinedDefaultTheme);
    } else if (themeAlias === 'dark') {
      setTheme(CombinedDarkTheme);
    }
  }, [themeAlias]);

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={theme}>
        <App />
      </NavigationContainer>
    </PaperProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);
