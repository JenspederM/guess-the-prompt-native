import React, {useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Text, useTheme} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import {useAtomValue, useSetAtom} from 'jotai';
import randomWords from 'random-words';

import {gameAtom, gameStyleAtom, userAtom} from '../atoms';
import {CustomGame, Game, GameStyle, StackListProps} from '../types';
import {getLogger} from '../utils';
import {getDefaultGameStyle} from '../utils/game';
import LabelledTextInput from '../components/LabelledTextInput';
import {StyleSheet, View} from 'react-native';
import {useSetSnack} from '../utils/hooks';
import {SimonsGameType} from '../games/simons/types';
import {OriginalGameType} from '../games/original/types';
import {createGame} from '../utils/firebase';
import SafeView from '../components/SafeView';
import {Slider} from '@miblanchard/react-native-slider';

const logger = getLogger('Host');

const Host = ({navigation}: NativeStackScreenProps<StackListProps, 'Host'>) => {
  const [numberOfRounds, setNumberOfRounds] = React.useState<number | number[]>(
    3,
  );
  const [imagesPerPlayer, setImagesPerPlayer] = React.useState<
    number | number[]
  >(2);
  const [roomCode, setRoomCode] = React.useState('');
  const setGame = useSetAtom(gameAtom);
  const gameStyle = useAtomValue(gameStyleAtom);
  const user = useAtomValue(userAtom);
  const setSnack = useSetSnack();
  const theme = useTheme();

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
      const safeNumberOfRounds =
        typeof numberOfRounds === 'number' ? numberOfRounds : numberOfRounds[0];
      const safeNumberOfImages =
        typeof imagesPerPlayer === 'number'
          ? imagesPerPlayer
          : imagesPerPlayer[0];

      switch (gameStyle) {
        case GameStyle.CUSTOM:
          gameSettings = getDefaultGameStyle({
            style: GameStyle.CUSTOM,
            host: user.id,
          }) as CustomGame;
          gameSettings.imagesPerPlayer = safeNumberOfImages;
          break;
        case GameStyle.SIMONS:
          gameSettings = getDefaultGameStyle({
            style: GameStyle.SIMONS,
            host: user.id,
          }) as SimonsGameType;
          gameSettings.numberOfRounds = safeNumberOfRounds;
          break;
        case GameStyle.ORIGINAL:
          gameSettings = getDefaultGameStyle({
            style: GameStyle.ORIGINAL,
            host: user.id,
          }) as OriginalGameType;
          gameSettings.imagesPerPlayer = safeNumberOfImages;
          break;
      }

      gameSettings.roomCode = roomCode;

      await createGame(gameSettings, user);

      setGame(gameSettings);
      setRoomCode(roomCode);
      navigation.navigate('Lobby', {gameId: gameSettings.id});
    }

    return true;
  };

  const styles = StyleSheet.create({
    container: {
      marginTop: 32,
      width: '100%',
      rowGap: 32,
    },
    slider: {
      backgroundColor: theme.colors.primaryContainer,
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderRadius: 16,
      width: '100%',
    },
  });

  return (
    <SafeView showBack showSettings centerItems>
      <Text className="my-8" variant="headlineLarge">
        Game Settings
      </Text>
      <View style={styles.container}>
        <LabelledTextInput
          title="Game Name"
          value={roomCode}
          onChangeValue={setRoomCode}
          icon="refresh"
          onIconPress={() => setRoomCode(randomWords(1)[0])}
        />

        <View style={styles.slider}>
          <Text variant="labelLarge" className="self-center">
            Number of rounds:
          </Text>
          <Text variant="titleMedium" className="self-center">
            {numberOfRounds}
          </Text>
          <Slider
            step={1}
            minimumValue={1}
            maximumValue={5}
            value={numberOfRounds}
            onValueChange={setNumberOfRounds}
            maximumTrackTintColor={theme.colors.primary}
            minimumTrackTintColor={theme.colors.secondary}
          />
        </View>
        <View style={styles.slider}>
          <Text variant="labelLarge" className="self-center">
            Images per player
          </Text>
          <Text variant="titleMedium" className="self-center">
            {imagesPerPlayer}
          </Text>
          <Slider
            step={1}
            minimumValue={1}
            maximumValue={3}
            value={imagesPerPlayer}
            onValueChange={setImagesPerPlayer}
            maximumTrackTintColor={theme.colors.primary}
            minimumTrackTintColor={theme.colors.secondary}
          />
        </View>

        <Button mode="contained" onPress={onCreateGame}>
          Create Game
        </Button>
      </View>
    </SafeView>
  );
};

export default Host;
