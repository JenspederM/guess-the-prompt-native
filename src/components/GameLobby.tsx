import React from 'react';
import {FlatList, View} from 'react-native';
import {Button, Text, useTheme} from 'react-native-paper';

import SafeView from './SafeView';
import {useGame} from '../GameProvider';
import {useUser} from '../AuthProvider';
import {useNavigation} from '@react-navigation/native';
import {startRound} from '../helpers/startRound';
import {leaveGame} from '../helpers/leaveGame';

const GameLobby = () => {
  const navigation = useNavigation();
  const game = useGame();
  const user = useUser();
  const theme = useTheme();

  const startGame = startRound(game?.game);

  const goBack = () => {
    leaveGame(game?.game, user?.user);
    navigation.navigate('Home');
  };

  return (
    <SafeView showBack onBack={goBack} centerItems>
      <View className="mb-12 w-full items-center">
        <Text variant="titleLarge" className="mb-2">
          Room Code
        </Text>
        <Text
          className="w-full text-center py-2"
          variant="headlineLarge"
          style={{
            backgroundColor: theme.colors.primaryContainer,
          }}>
          {game?.game.roomCode}
        </Text>
      </View>
      <Text className="mb-4" variant="titleLarge">
        Players
      </Text>
      <FlatList
        data={game?.players}
        renderItem={({item}) => {
          return (
            <View className="flex-row items-center justify-between w-80 text-2xl mb-2">
              <Text variant="headlineLarge">
                {item.id === game?.game?.host ? '👑' : '🤾‍♂️'}
              </Text>
              <Text variant="headlineMedium">{item.name}</Text>
              <Text variant="headlineLarge">
                {item.id === game?.game?.host ? '👑' : '🤾‍♂️'}
              </Text>
            </View>
          );
        }}
        keyExtractor={item => item.id}
      />
      {game?.game.host === user?.user?.id && (
        <View className="w-full">
          <Button
            disabled={game ? game.players.length < 2 : false}
            onPress={startGame}
            mode="contained">
            Start Game
          </Button>
        </View>
      )}
    </SafeView>
  );
};

export default GameLobby;
