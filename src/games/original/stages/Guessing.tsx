import React, {useEffect} from 'react';
import {Container} from '../../../components/Container';
import {OriginalGameStageEnum, OriginalGameType, PromptedImage} from '../types';
import {firebaseGuid, setPlayerReadiness} from '../../../utils/firebase';
import ImagePreview from '../components/ImagePreview';
import LabelledTextInput from '../../../components/LabelledTextInput';
import {ActivityIndicator, Button, Text} from 'react-native-paper';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {useOnMount, usePlayers} from '../../../utils/hooks';
import {setGameStage} from '../../../utils/game';
import {useAtomValue} from 'jotai';
import {userAtom} from '../../../atoms';
import {DEFAULT_USER_ID, getLogger} from '../../../utils';
import firestore from '@react-native-firebase/firestore';
const DEFAULT_IMAGE = require('../../../data/defaultImage.json');

const logger = getLogger('OriginalGame.Guessing');

const Guessing = ({game}: {game: OriginalGameType}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [image, setImage] = React.useState<PromptedImage>();
  const [guess, setGuess] = React.useState('');
  const [locked, setLocked] = React.useState(false); // TODO: [locked, setLocked] = useLocked(game.id);
  const user = useAtomValue(userAtom);
  const players = usePlayers(game.id);

  useOnMount(() => {
    if (!game || !user) {
      logger.debug('No game or user, returning');
      return;
    }
    setPlayerReadiness(game.id, user.id || DEFAULT_USER_ID, false).catch(
      err => {
        logger.error('Error setting player readiness', err);
      },
    );
  });

  useEffect(() => {
    if (user && game.host !== user.id) return;
    const allFinished = players.every(player => player.isReady === true);
    if (players.length > 0 && allFinished === true) {
      logger.debug('All players are ready', players);
      setTimeout(() => {
        setGameStage(game.id, OriginalGameStageEnum.GUESSING);
      }, 1000);
    }
  }, [game, user, players]);

  useEffect(() => {
    const currentImage = game.currentImage || {
      id: firebaseGuid(),
      label: 'Default Image',
      value: firebaseGuid(),
      type: 'b64_json',
      prompt: 'A lawn char in space',
      uri: `data:image/png;base64,${DEFAULT_IMAGE.image}`,
    };
    setIsLoading(false);
    setImage(currentImage);
  }, [game]);

  const saveGuess = () => {
    if (!user || !image) return;
    console.log('Guessing', guess);
    setPlayerReadiness(game.id, user.id || DEFAULT_USER_ID, true).catch(err => {
      logger.error('Error setting player readiness', err);
    });

    firestore()
      .collection('games')
      .doc(game.id)
      .collection('guesses')
      .doc(user.id || DEFAULT_USER_ID)
      .set({
        guess,
        imageId: image.value,
        createdAt: firestore.FieldValue.serverTimestamp(),
        userId: user.id || DEFAULT_USER_ID,
      });

    setLocked(true);
    setGuess('');
  };

  const unlock = () => {
    if (!user || !image) return;

    setPlayerReadiness(game.id, user.id || DEFAULT_USER_ID, false).catch(
      err => {
        logger.error('Error setting player readiness', err);
      },
    );

    firestore()
      .collection('games')
      .doc(game.id)
      .collection('guesses')
      .doc(user.id)
      .set({
        guess,
        imageId: image.value,
        createdAt: firestore.FieldValue.serverTimestamp(),
        userId: user.id || DEFAULT_USER_ID,
      });

    setLocked(false);
  };

  const center = true;

  const Styles = StyleSheet.create({
    Container: {
      width: '100%',
      justifyContent: center ? 'center' : 'flex-start',
      alignItems: center ? 'center' : 'flex-start',
      rowGap: 16,
    },
    Text: {
      marginVertical: 8,
    },
  });

  if (locked) {
    return (
      <Container center>
        <Text>Locked</Text>
        <Button onPress={unlock}>Unlock</Button>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container center>
        <Text>Loading...</Text>
        <ActivityIndicator />
      </Container>
    );
  }

  return (
    <Container center>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={Styles.Container}>
            <Text style={Styles.Text} variant="headlineSmall">
              Guess the Prompt!
            </Text>
            {image && <ImagePreview image={image} maskPrompt />}
          </View>
          <LabelledTextInput
            title="What prompt was used to generate this?"
            label="Enter your guess here"
            value={guess}
            onChangeValue={setGuess}
            icon="chevron-right"
            onIconPress={saveGuess}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default Guessing;
