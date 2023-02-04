import React, {useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Text} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import {useAtomValue, useSetAtom} from 'jotai';
import randomWords from 'random-words';

import {Container} from '../components/Container';
import {gameAtom, gameStyleAtom, userAtom} from '../atoms';
import {CustomGame, Game, GameStyle, StackListProps} from '../types';
import {getLogger} from '../utils';
import {getDefaultGameStyle} from '../utils/game';
import LabelledTextInput from '../components/LabelledTextInput';
import {StyleSheet, View} from 'react-native';
import RoomCode from '../components/RoomCode';
import {useSetSnack} from '../utils/hooks';
import {SimonsGameType} from '../games/simons/types';
import {OriginalGameType} from '../games/original/types';
import {createGame} from '../utils/firebase';

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
  }, []);

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

      switch (gameStyle) {
        case GameStyle.CUSTOM:
          gameSettings = getDefaultGameStyle({
            style: GameStyle.CUSTOM,
            host: user.id,
          }) as CustomGame;
          gameSettings.imagesPerPlayer = parseInt(imagesPerPlayer, 10);
          break;
        case GameStyle.SIMONS:
          gameSettings = getDefaultGameStyle({
            style: GameStyle.SIMONS,
            host: user.id,
          }) as SimonsGameType;
          gameSettings.nRounds = 5;
          break;
        case GameStyle.ORIGINAL:
          gameSettings = getDefaultGameStyle({
            style: GameStyle.ORIGINAL,
            host: user.id,
          }) as OriginalGameType;
          gameSettings.imagesPerPlayer = parseInt(imagesPerPlayer, 10);
          break;
      }

      gameSettings.roomCode = roomCode;
      gameSettings.maxNumberOfPLayers = parseInt(maxNumberOfPLayers, 10);

      await createGame(gameSettings, user);

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
    <Container
      showSettings
      showBackButton
      onGoBack={() => navigation.goBack()}
      snackAction={{
        label: 'Try again',
        onPress: () => setRoomCode(randomWords(1)[0]),
      }}
      snackDuration={5 * 60 * 1000}>
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
