import React, {useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Text} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import {useAtomValue} from 'jotai';

import {StackListProps} from '../types';
import {userAtom} from '../atoms';
import {Container} from '../components/Container';
import {getLogger} from '../utils';
import {leaveGame} from '../utils/game';
import {useGame} from '../utils/hooks';
import PlayerList from '../components/PlayerList';
import RoomCode from '../components/RoomCode';
import Divider from '../components/Divider';

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

  if (!game) return null;

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
      <RoomCode roomCode={game?.roomCode} />
      <Divider />
      <PlayerList title="Players" gameId={gameId} />
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
