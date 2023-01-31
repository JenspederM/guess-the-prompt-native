import React, {useCallback, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {View} from 'react-native';
import {Avatar, Button, Divider, Surface, Text} from 'react-native-paper';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {useAtomValue} from 'jotai';

import {Game, Player, StackListProps} from '../types';
import {userAtom} from '../atoms';
import {Container} from '../components/Container';
import {getLogger} from '../utils';
import {leaveGame} from '../utils/game';
import {useFocusEffect} from '@react-navigation/native';

const logger = getLogger('Lobby');

const PlayerList = ({players}: {players: Player[]}) => {
  if (!players) return null;

  if (players.length <= 1) {
    return (
      <View>
        <Text variant="titleLarge" className="font-bold mb-2">
          Waiting for players...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex flex-row flex-wrap gap-4">
      {players.reverse().map((player, index) => {
        return (
          <Surface
            key={index}
            className="flex flex-col px-4 py-2 items-center rounded">
            <Avatar.Icon icon="account" size={32} />
            <Text variant="titleLarge">{player.name}</Text>
          </Surface>
        );
      })}
    </View>
  );
};

const Lobby = ({
  navigation,
  route,
}: NativeStackScreenProps<StackListProps, 'Lobby'>) => {
  const {gameId} = route.params;
  const user = useAtomValue(userAtom);
  const [game, setGame] = useState<Game>();
  const [players, setPlayers] = useState<Player[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        navigation.navigate('Home');
        return;
      }

      const _logger = logger.m('onMount');

      _logger.debug('Subscribing to game', gameId);
      const unsubGame = firestore()
        .collection('games')
        .doc(gameId)
        .onSnapshot(doc => {
          if (doc && !doc.exists) {
            _logger.debug('Game does not exist');
            return;
          }

          const currentGame = doc.data() as Game;
          _logger.info('Game changed', currentGame);
          if (currentGame.isStarted) {
            _logger.debug('Game is started, navigating to game');
            navigation.navigate('Game', {gameId});
            return;
          }

          setGame(currentGame);
        }, logger.error);

      _logger.debug('Subscribing to players', gameId);
      const unsubPlayers = firestore()
        .collection('games')
        .doc(gameId)
        .collection('players')
        .onSnapshot((querySnapshot: FirebaseFirestoreTypes.DocumentData) => {
          _logger.debug('Players changed', querySnapshot);
          const updatedPlayers: Player[] = [];
          querySnapshot.forEach(
            (docSnap: FirebaseFirestoreTypes.DocumentSnapshot<Player>) => {
              if (docSnap.exists) {
                const player = docSnap.data() as Player;
                updatedPlayers.push(player);
              }
            },
          );
          setPlayers(updatedPlayers);
        }, logger.error);

      return () => {
        _logger.debug('Unsubscribing from game and players');
        unsubGame();
        unsubPlayers();
      };
    }, []), // eslint-disable-line react-hooks/exhaustive-deps
  );

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
            <PlayerList players={players} />
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
