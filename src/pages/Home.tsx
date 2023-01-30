import React from 'react';
import {Button, Text} from 'react-native-paper';
import {Container} from '../components/Container';
import {View} from 'react-native';

const Home = () => {
  return (
    <Container showSettings>
      <View className="h-1/3 items-center justify-center">
        <Text variant="headlineLarge">Guess the Prompt!</Text>
      </View>
      <View className="flex-1 justify-end">
        <Button mode="contained">Play</Button>
      </View>
    </Container>
  );
};

export default Home;
