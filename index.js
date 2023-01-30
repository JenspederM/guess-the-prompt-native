import * as React from 'react';
import {AppRegistry} from 'react-native';
import {Provider as PaperProvider} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';
import {useAtomValue} from 'jotai';

import App from './src/App';
import {name as appName} from './app.json';
import {themeAliasAtom} from './src/atoms';
import {getTheme} from './src/utils/themes';

export default function Main() {
  const [theme, setTheme] = React.useState(getTheme('light'));
  const themeAlias = useAtomValue(themeAliasAtom);

  React.useEffect(() => {
    const newTheme = getTheme(themeAlias);
    console.log('newTheme', newTheme);
    setTheme(newTheme);
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
