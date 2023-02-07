import React, {useEffect, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Chip, Text} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import {useAtomValue} from 'jotai';

import {Player, StackListProps} from '../types';
import {userAtom} from '../atoms';
import {getLogger} from '../utils';
import {leaveGame} from '../utils/game';
import {useGame, useOnMount} from '../utils/hooks';
import {ScrollView, StyleSheet, View} from 'react-native';
import SafeView from '../components/SafeView';
import Surface from '../components/Surface';

const logger = getLogger('Lobby');

const Lobby = ({
  navigation,
  route,
}: NativeStackScreenProps<StackListProps, 'Lobby'>) => {
  const {gameId} = route.params;
  const user = useAtomValue(userAtom);
  const game = useGame(gameId);
  const [allReady, setAllReady] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (game?.isStarted) {
      navigation.navigate('Game', {gameId: gameId});
    }
  }, [game, gameId, navigation]);

  useEffect(() => {
    if (players) {
      const allReadyCheck = players.every(player => player.isReady);
      setAllReady(allReadyCheck);
      logger.info('allReady', allReadyCheck);
      logger.debug('allReady players', players);
    }
  }, [players]);

  useOnMount(async () => {
    await firestore()
      .collection('games')
      .doc(gameId)
      .collection('players')
      .get()
      .then(querySnapshot => {
        const newPlayers: Player[] = [];
        querySnapshot.forEach(doc => {
          const player = doc.data() as Player;
          if (player.id === user?.id) {
            setIsReady(player.isReady || false);
          }
          newPlayers.push(player);
        });
        setPlayers(newPlayers);
      });
  });

  if (!game) return null;

  const _leaveGame = () => {
    leaveGame(gameId, user?.id, () => navigation.navigate('Home'));
  };

  const startGame = async () => {
    if (!game || user?.id !== game.host) return;
    if (!allReady) return;
    logger.m('startGame').debug('Starting game');
    await firestore().collection('games').doc(gameId).update({
      isStarted: true,
      status: 'started',
    });
    navigation.navigate('Game', {gameId: gameId});
  };

  const Styles = StyleSheet.create({
    Text: {
      width: '100%',
      textAlign: 'center',
    },
    Chip: {
      width: '100%',
      height: 48,
    },
  });

  const renderPlayer = (player: Player, index: number) => {
    return (
      <View
        key={player.id}
        className={`w-full ${index === players.length - 1 ? '' : 'mb-4'}`}>
        <Chip
          style={Styles.Chip}
          icon={player.isReady ? 'check' : 'close'}
          disabled={!player.isReady}
          key={index}>
          {player.name}
        </Chip>
      </View>
    );
  };

  const toggleReady = async () => {
    logger.m('toggleReady').debug('Toggling ready');
    await firestore()
      .collection('games')
      .doc(gameId)
      .collection('players')
      .doc(user?.id)
      .update({
        isReady: !isReady,
      });

    await firestore()
      .collection('games')
      .doc(gameId)
      .collection('players')
      .get()
      .then(querySnapshot => {
        const newPlayers: Player[] = [];
        querySnapshot.forEach(doc => {
          newPlayers.push(doc.data() as Player);
        });
        setPlayers(newPlayers);
      });

    setIsReady(!isReady);
  };

  return (
    <SafeView centerItems showSettings showBack onBack={_leaveGame} rowGap={32}>
      <View className="items-center gap-y-4">
        <Text variant="titleLarge">Room Code</Text>
        <Surface className="flex items-center">
          <Text variant="headlineMedium">{game.roomCode}</Text>
        </Surface>
      </View>

      <ScrollView>
        <View className="items-center gap-y-4">
          <Text variant="titleLarge">Players</Text>
          <Surface flexDirection="column">
            {players &&
              players.map((player, index) => renderPlayer(player, index))}
          </Surface>
        </View>
      </ScrollView>

      <View className="w-80 gap-y-4">
        <Button
          mode={!isReady ? 'contained' : 'contained-tonal'}
          onPress={toggleReady}>
          {!isReady ? 'Ready' : 'Not Ready'}
        </Button>
        {game?.host === user?.id && (
          <Button mode="contained" onPress={startGame}>
            Start Game
          </Button>
        )}
      </View>
    </SafeView>
  );
};

export default Lobby;
