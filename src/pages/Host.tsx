import React, {useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Text} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import {useAtomValue, useSetAtom} from 'jotai';
import randomWords from 'random-words';

import {Container} from '../components/Container';
import {gameAtom, gameStyleAtom, userAtom} from '../atoms';
import {Game, StackListProps} from '../types';
import {getLogger} from '../utils';
import {getDefaultGameStyle, getDefaultPlayer} from '../utils/game';
import LabelledTextInput from '../components/LabelledTextInput';
import {StyleSheet, View} from 'react-native';
import RoomCode from '../components/RoomCode';
import {useSetSnack} from '../utils/hooks';

const logger = getLogger('Host');

const Host = ({navigation}: NativeStackScreenProps<StackListProps, 'Host'>) => {
  const [maxNumberOfPLayers, setMaxNumberOfPLayers] = React.useState('6');
  const [imagesPerPlayer, setImagesPerPlayer] = React.useState('1');
  const [roomCode, setRoomCode] = React.useState('');
  const setGame = useSetAtom(gameAtom);
  const gameStyle = useAtomValue(gameStyleAtom);
  const user = useAtomValue(userAtom);
  const setSnack = useSetSnack();

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
      setSnack('Game already exists with room code.\nTry again.');
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

  const Styles = StyleSheet.create({
    Container: {
      marginTop: 32,
      width: '100%',
      rowGap: 32,
    },
  });

  return (
    <Container showSettings showBackButton onGoBack={() => navigation.goBack()}>
      <Text variant="headlineLarge">Game Settings</Text>
      <View style={Styles.Container}>
        <RoomCode title="Room Code" roomCode={roomCode} />
        <LabelledTextInput
          title="Max Players"
          value={maxNumberOfPLayers}
          onChangeValue={setMaxNumberOfPLayers}
          placeholder="0"
          keyboardType="numeric"
        />
        <LabelledTextInput
          title="Images per Player"
          value={imagesPerPlayer}
          onChangeValue={setImagesPerPlayer}
          placeholder="0"
          keyboardType="numeric"
        />
        <Button mode="contained" onPress={onCreateGame}>
          Create Game
        </Button>
      </View>
    </Container>
  );
};

export default Host;
