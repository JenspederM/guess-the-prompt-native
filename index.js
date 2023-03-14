import * as React from 'react';
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import AuthProvider from './src/AuthProvider';

export default function Main() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);
