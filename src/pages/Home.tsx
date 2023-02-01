import React from 'react';
import {Button, Text} from 'react-native-paper';
import {Container} from '../components/Container';
import {StyleSheet, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {StackListProps} from '../types';

const Home = ({navigation}: NativeStackScreenProps<StackListProps, 'Home'>) => {
  const Styles = StyleSheet.create({
    Title: {
      height: '33%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    Buttons: {
      flex: 1,
      justifyContent: 'flex-end',
      width: '100%',
    },
  });

  return (
    <Container showSettings>
      <View style={Styles.Title}>
        <Text variant="headlineLarge">Guess the Prompt!</Text>
      </View>
      <View style={Styles.Buttons}>
        <Button mode="contained" onPress={() => navigation.navigate('Play')}>
          Play
        </Button>
      </View>
    </Container>
  );
};

export default Home;
