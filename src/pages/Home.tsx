import React from 'react';
import {Button, Text} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {StackListProps} from '../types';
import SafeView from '../components/SafeView';

const Home = ({navigation}: NativeStackScreenProps<StackListProps, 'Home'>) => {
  const Styles = StyleSheet.create({
    Title: {
      flexGrow: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    Buttons: {
      flexGrow: 1,
      justifyContent: 'center',
      width: '100%',
      rowGap: 16,
    },
  });

  return (
    <SafeView centerItems>
      <View style={Styles.Title}>
        <Text variant="headlineLarge">Guess the Prompt!</Text>
      </View>
      <View style={Styles.Buttons}>
        <Button mode="contained" onPress={() => navigation.navigate('Play')}>
          Play
        </Button>
      </View>
    </SafeView>
  );
};

export default Home;
