import React, {useEffect, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Snackbar, Text, TextInput} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import {useAtomValue, useSetAtom} from 'jotai';
import randomWords from 'random-words';

import {Container} from '../components/Container';
import {View} from 'react-native';
import {gameAtom, gameStyleAtom, userAtom} from '../atoms';
import {Game, StackListProps} from '../types';
import {getLogger} from '../utils';
import {getDefaultGameStyle, getDefaultPlayer} from '../utils/game';

const logger = getLogger('Host');

const Host = ({navigation}: NativeStackScreenProps<StackListProps, 'Host'>) => {
  const [maxNumberOfPLayers, setMaxNumberOfPLayers] = React.useState('6');
  const [imagesPerPlayer, setImagesPerPlayer] = React.useState('1');
  const [roomCode, setRoomCode] = React.useState('');
  const setGame = useSetAtom(gameAtom);
  const gameStyle = useAtomValue(gameStyleAtom);
  const user = useAtomValue(userAtom);

  useEffect(() => {
    setRoomCode(randomWords(1)[0]);

    if (gameStyle === '') {
      logger.m('useEffect').debug('gameStyle is empty');
      return;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onCreateGame = async () => {
    if (!user) {
      logger.m('onCreateGame').error('User is not logged in');
      return;
    }

    const colidingGamesQuery = await firestore()
      .collection('games')
      .where('isStarted', '==', false)
      .where('isExpired', '==', false)
      .where('roomCode', '==', roomCode)
      .count()
      .get();

    if (colidingGamesQuery.data().count > 0) {
      logger.m('onCreateGame').debug('Game already exists with room code');
      setVisible(true);
      setSnackbarText('Game already exists with room code.\nTry again.');
      return false;
    } else {
      let gameSettings: Game;

      switch (gameStyle.toLowerCase()) {
        case 'custom':
          gameSettings = getDefaultGameStyle({
            style: 'custom',
            host: user.id,
          });
          gameSettings.imagesPerPlayer = parseInt(imagesPerPlayer, 10);
          break;
        default:
          gameSettings = getDefaultGameStyle({
            style: 'original',
            host: user.id,
          });
          gameSettings.imagesPerPlayer = parseInt(imagesPerPlayer, 10);
          break;
      }

      gameSettings.roomCode = roomCode;
      gameSettings.maxNumberOfPLayers = parseInt(maxNumberOfPLayers, 10);

      logger.m('onCreateGame').debug('Creating game', gameSettings);
      await firestore()
        .collection('games')
        .doc(gameSettings.id)
        .set(gameSettings);

      const player = getDefaultPlayer({id: user.id, alias: user.alias});
      player.isHost = true;

      logger.m('onCreateGame').debug('Joining newly created game', player);
      await firestore()
        .collection('games')
        .doc(gameSettings.id)
        .collection('players')
        .doc(player.id)
        .set(player);

      await firestore()
        .collection('games')
        .doc(gameSettings.id)
        .update({
          players: firestore.FieldValue.arrayUnion(player.id),
        });

      setGame(gameSettings);
      setRoomCode(roomCode);

      navigation.navigate('Lobby', {gameId: gameSettings.id});
    }

    return true;
  };

  const [visibleSnackbar, setVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState<string | null>(null);
  const onDismissSnackBar = () => setVisible(false);

  return (
    <Container showBackButton onGoBack={() => navigation.goBack()}>
      <View className="flex-1 w-full gap-y-8">
        <Text variant="headlineLarge">Game Settings</Text>

        <View className="flex gap-y-2">
          <Text variant="labelLarge">Room Code</Text>
          <View className="flex flex-row w-full space-x-2">
            <TextInput
              className="flex-row flex-1"
              placeholder="0"
              value={roomCode}
              disabled
            />
          </View>
        </View>
        <View className="flex gap-y-2">
          <Text variant="labelLarge">Maximum number of players</Text>
          <TextInput
            className="w-full"
            keyboardType="numeric"
            placeholder="0"
            value={maxNumberOfPLayers}
            onChangeText={setMaxNumberOfPLayers}
          />
        </View>
        <View className="flex gap-y-2">
          <Text variant="labelLarge">
            How many images should each player generate?
          </Text>
          <TextInput
            className="w-full"
            keyboardType="numeric"
            placeholder="0"
            value={imagesPerPlayer}
            onChangeText={setImagesPerPlayer}
          />
        </View>
      </View>
      <View>
        <Button mode="contained" onPress={onCreateGame}>
          Create Game
        </Button>
      </View>
      <Snackbar
        visible={visibleSnackbar}
        onDismiss={onDismissSnackBar}
        action={{
          label: 'Generate New',
          onPress: () => {
            setRoomCode(randomWords(1)[0]);
          },
        }}>
        {snackbarText}
      </Snackbar>
    </Container>
  );
};

export default Host;
