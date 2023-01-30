import React from 'react';
import {Button, Text} from 'react-native-paper';
import {Container} from '../components/Container';
import {View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {StackListProps} from '../types';

const Home = ({navigation}: NativeStackScreenProps<StackListProps, 'Home'>) => {
  return (
    <Container showSettings>
      <View className="h-1/3 items-center justify-center">
        <Text variant="headlineLarge">Guess the Prompt!</Text>
      </View>
      <View className="flex-1 justify-end">
        <Button mode="contained" onPress={() => navigation.navigate('Play')}>
          Play
        </Button>
      </View>
    </Container>
  );
};

export default Home;
