import React, {useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {View} from 'react-native';
import {Avatar, Button, Surface, Text} from 'react-native-paper';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {GameStyle, Player, StackListProps} from '../types';
import {useEffect} from 'react';
import {useAtom, useAtomValue} from 'jotai';
import {gameAtom, userAtom} from '../atoms';
import {Container} from '../components/Container';
import {getLogger} from '../utils';

const logger = getLogger('Lobby');

const Lobby = ({
  navigation,
  route,
}: NativeStackScreenProps<StackListProps, 'Lobby'>) => {
  const {gameId} = route.params;
  const user = useAtomValue(userAtom);
  const [game, setGame] = useAtom(gameAtom);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (!user) return;
    if (!game) return;

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
        _logger.info('Current data: ', doc.data());
        setGame(doc.data() as GameStyle);
      });

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
      });

    return () => {
      unsubGame();
      unsubPlayers();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const leaveGame = async () => {
    logger.m('leaveGame').debug('Leaving game');

    await firestore()
      .collection('games')
      .doc(gameId)
      .collection('players')
      .doc(user?.id)
      .delete();

    await firestore()
      .collection('games')
      .doc(gameId)
      .update({
        players: firestore.FieldValue.arrayRemove(user?.id),
      });

    navigation.goBack();
  };

  const startGame = async () => {
    if (!game) return;
    logger.m('startGame').debug('Starting game');

    await firestore().collection('games').doc(game.id).update({
      isStarted: true,
    });

    navigation.navigate('Game', {gameId: game.id});
  };

  return (
    <Container
      showBackButton
      onGoBack={() => leaveGame()}
      goBackLabel="Leave Game">
      <View className="flex-1 w-full gap-y-8">
        <View className="gap-y-2">
          <Text variant="titleLarge" className="font-bold">
            Room Code
          </Text>
          <Surface className="py-2 px-4 items-center">
            <Text variant="titleLarge">{game?.roomCode.toUpperCase()}</Text>
          </Surface>
        </View>

        <View>
          <Text variant="titleLarge" className="font-bold mb-2">
            Players
          </Text>
          <View className="flex flex-row flex-wrap gap-4">
            {players.reverse().map((player, index) => {
              logger.debug('Drawing player', player);
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
        </View>
      </View>
      <View>
        <Button mode="contained" onPress={startGame}>
          Start Game
        </Button>
      </View>
    </Container>
  );
};

export default Lobby;
