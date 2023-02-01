import React, {useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {View} from 'react-native';
import {Button, Divider, Surface, Text} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import {useAtomValue} from 'jotai';

import {StackListProps} from '../types';
import {userAtom} from '../atoms';
import {Container} from '../components/Container';
import {getLogger} from '../utils';
import {leaveGame} from '../utils/game';
import {useGame} from '../utils/firebase';
import PlayerList from '../components/PlayerList';

const logger = getLogger('Lobby');

const Lobby = ({
  navigation,
  route,
}: NativeStackScreenProps<StackListProps, 'Lobby'>) => {
  const {gameId} = route.params;
  const user = useAtomValue(userAtom);
  const game = useGame(gameId);

  useEffect(() => {
    if (game?.isStarted) {
      navigation.navigate('Game', {gameId: gameId});
    }
  }, [game, gameId, navigation]);

  const _leaveGame = () => {
    leaveGame(gameId, user?.id, () => navigation.goBack());
  };

  const startGame = async () => {
    logger.m('startGame').debug('Starting game');
    await firestore().collection('games').doc(gameId).update({
      isStarted: true,
      status: 'started',
    });
    navigation.navigate('Game', {gameId: gameId});
  };

  return (
    <Container
      showSettings
      showBackButton
      onGoBack={() => _leaveGame()}
      goBackLabel="Leave Game">
      <View className="flex-1 gap-y-6">
        <View className="gap-y-2">
          <Text variant="titleLarge" className="font-bold">
            Room Code
          </Text>
          <Surface className="py-2 px-4 items-center">
            <Text variant="titleLarge">{game?.roomCode.toUpperCase()}</Text>
          </Surface>
        </View>
        <Divider />
        <View className="gap-y-2">
          <Text variant="titleLarge" className="font-bold">
            Players
          </Text>
          <View>
            <PlayerList gameId={gameId} />
          </View>
        </View>
      </View>
      {game?.host === user?.id ? (
        <Button mode="contained" onPress={startGame}>
          Start Game
        </Button>
      ) : (
        <Text variant="titleMedium" className="text-center">
          Waiting for the host to start...
        </Text>
      )}
    </Container>
  );
};

export default Lobby;
