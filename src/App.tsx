/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {PropsWithChildren} from 'react';
import {SafeAreaView, Text} from 'react-native';
import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {Button} from 'react-native-paper';

export type StackListProps = {
  Host: undefined;
  Profile: undefined;
  Login: undefined;
  Home: undefined;
  Play: undefined;
  Lobby: {roomCode?: string; gameId: string};
  Game: {roomCode?: string; gameId: string};
  Settings: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<StackListProps>();

function Container({children}: PropsWithChildren) {
  return (
    <SafeAreaView className="flex flex-grow items-center justify-center">
      {children}
    </SafeAreaView>
  );
}

function Home({navigation}: NativeStackScreenProps<StackListProps, 'Home'>) {
  return (
    <Container>
      <Text>Home</Text>
      <Button onPress={() => navigation.navigate('Profile')}>
        Go to Profile
      </Button>
    </Container>
  );
}

function Notifications() {
  return (
    <Container>
      <Text>Notifications</Text>
    </Container>
  );
}

function Profile({
  navigation,
}: NativeStackScreenProps<StackListProps, 'Profile'>) {
  return (
    <Container>
      <Text>Profile</Text>
      <Button onPress={() => navigation.navigate('Home')}>Go to Home</Button>
    </Container>
  );
}

function Settings() {
  return (
    <Container>
      <Text>Settings</Text>
    </Container>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Settings" component={Settings} />
    </Stack.Navigator>
  );
}

function App(): JSX.Element {
  return <AppStack />;
}

export default App;
