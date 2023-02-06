import React from 'react';
import {Button, Text} from 'react-native-paper';
import {Container} from '../../../components/Container';
import {SimonsGameType} from '../types';
import {ScrollView, View} from 'react-native';
import {useAtomValue} from 'jotai';
import {PlayersAtom} from '../atoms';
import Surface from '../../../components/Surface';
import {userAtom} from '../../../atoms';
import {useNavigation} from '@react-navigation/native';

const Finish = ({game}: {game: SimonsGameType}) => {
  const navigation = useNavigation();
  const user = useAtomValue(userAtom);
  const players = useAtomValue(PlayersAtom).sort((a, b) => b.score - a.score);
  const bestPlayer = players.sort((a, b) => b.score - a.score)[0];
  console.log('game', game);

  const leave = () => {
    console.log('leave');
    navigation.navigate('Home');
  };

  return (
    <Container center>
      <View className="w-full">
        <Text variant="headlineLarge">Winner!</Text>
        <Surface>
          <View className="flex-row items-center">
            <View className="grow">
              <Text variant="headlineMedium">
                {bestPlayer.name} with {bestPlayer.score} points
              </Text>
            </View>
          </View>
        </Surface>
        <Text className="mt-8" variant="headlineMedium">
          The Rest!
        </Text>
        <ScrollView className="w-full">
          {players &&
            players.map((player, i) => {
              if (i === 0) return;
              return (
                <View key={i} className="mb-4">
                  <Surface>
                    <View className="flex-row items-center">
                      <View className="grow">
                        <Text variant="titleMedium">{player.name}</Text>
                      </View>
                      <View className="flex-row items-center gap-x-2">
                        <Text variant="titleMedium">Score</Text>
                        <Text variant="titleMedium">{player.score}</Text>
                      </View>
                    </View>
                  </Surface>
                </View>
              );
            })}
        </ScrollView>
      </View>
      <View className="w-full my-8">
        <Button onPress={leave} mode="contained">
          {user && game.host === user.id ? 'End Game' : 'Leave Game'}
        </Button>
      </View>
    </Container>
  );
};

export default Finish;
