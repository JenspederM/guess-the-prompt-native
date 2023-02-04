import React, {useEffect, useState} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

import {getLogger} from '../../../utils';
import {setPlayerReadiness} from '../../../utils/firebase';
import {useAtomValue} from 'jotai';
import {userAtom} from '../../../atoms';
import ImagePreview from '../components/ImagePreview';
import ImageLoading from '../components/ImageLoading';
import ImagePrompt from '../components/ImagePrompt';
import PlayerList from '../../../components/PlayerList';
import Divider from '../../../components/Divider';
import {OriginalGameStageEnum, OriginalGameType, PromptedImage} from '../types';
import {generateImageFromPrompt} from '../api';
import {usePlayers} from '../../../utils/hooks';
import {Container} from '../../../components/Container';
import {setGameStage} from '../../../utils/game';

const logger = getLogger('Draw');

const WaitingForPlayers = ({
  game,
  savedImages,
}: {
  game: OriginalGameType;
  savedImages: PromptedImage[];
}) => {
  const _log = logger.getChildLogger('WaitingForPlayers');
  const players = usePlayers(game.id);
  const user = useAtomValue(userAtom);
  const [image, setImage] = useState<PromptedImage>(savedImages[0]);

  useEffect(() => {
    if (!game || !user) return;
    setPlayerReadiness(game.id, user.id, true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user && game.host !== user.id) return;
    const allFinished = players.every(player => player.isReady === true);
    if (players.length > 0 && allFinished === true) {
      _log.debug('All players are ready', players);
      setTimeout(() => {
        setGameStage(game.id, OriginalGameStageEnum.GUESSING);
      }, 1000);
    }
  }, [_log, game, user, players]);

  const images = savedImages.map((img, idx) => {
    return {
      ...img,
      label: `Image ${idx + 1}`,
    };
  });

  const onSelect = (value: string) => {
    const selectedImage = savedImages.find(img => img.value === value);
    if (!selectedImage) return;
    setImage(selectedImage);
  };

  return (
    <Container center>
      <PlayerList
        players={players}
        title="Waiting for other players"
        showReady
      />
      <Divider />
      <ImagePreview
        title="Your saved images"
        image={image}
        images={images}
        onSelect={onSelect}
      />
    </Container>
  );
};

const Draw = ({game}: {game: OriginalGameType}) => {
  const _log = logger.getChildLogger('Drawing');
  const MAX_ATTEMPTS = 3;
  const MAX_IMAGES = game.imagesPerPlayer;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [image, setImage] = useState<PromptedImage | null>(null);
  const [attempts, setAttempts] = useState<PromptedImage[]>([]);
  const [savedImages, setSavedImages] = useState<PromptedImage[]>([]);
  const [prompt, setPrompt] = useState('');
  const user = useAtomValue(userAtom);

  useEffect(() => {
    const lastAttempt = attempts[attempts.length - 1];
    if (lastAttempt) {
      setImage(lastAttempt);
    } else {
      setImage(null);
    }
  }, [attempts]);

  const onSelect = (value: string) => {
    const newImage = attempts.find(img => img.value === value);
    if (!newImage) {
      _log.m('onSelect').error('Image not found', value);
      return;
    }
    setImage(newImage);
  };

  const onDraw = async () => {
    if (attempts.length >= MAX_ATTEMPTS) {
      _log.m('drawNewImage').error('Max attempts reached');
      return;
    }
    if (!user) {
      _log.m('drawNewImage').error('No user to draw image for');
      return;
    }
    if (!prompt) {
      _log.m('drawNewImage').error('No prompt to draw image from');
      return;
    }
    setIsLoading(true);
    Keyboard.isVisible() && Keyboard.dismiss();
    _log.m('drawNewImage').debug('Generating new image from prompt', prompt);
    const newImage = await generateImageFromPrompt(
      `Attempt ${attempts.length + 1}`,
      prompt,
    );

    _log.m('drawNewImage').debug('Adding new image to attempts');
    setImage(newImage);
    setAttempts([...attempts, newImage]);
    setPrompt('');
    setIsLoading(false);
  };

  const onSave = () => {
    if (!image) {
      _log.m('saveImage').debug('No image to save');
      return;
    }
    if (!user) {
      _log.m('saveImage').debug('No user to save image for');
      return;
    }

    _log.m('saveImage').debug('Saving image', image.label);
    firestore()
      .collection('games')
      .doc(game.id)
      .collection('images')
      .add({
        id: image.value,
        ...image,
        playerId: user.id,
        createdAt: firestore.FieldValue.serverTimestamp(),
        guessed: false,
      });

    const newSavedImages = [...savedImages, image];
    setImage(null);
    setSavedImages(newSavedImages);
    setAttempts([]);
  };

  if (savedImages.length === MAX_IMAGES) {
    return <WaitingForPlayers game={game} savedImages={savedImages} />;
  }

  const Styles = StyleSheet.create({
    Container: {
      flexGrow: 1,
      width: '100%',
    },
    ViewContainer: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
    },
  });

  return (
    <Container center>
      <KeyboardAvoidingView
        style={Styles.Container}
        keyboardVerticalOffset={32}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={Styles.Container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={Styles.ViewContainer}>
            {image ? (
              <ImagePreview
                image={image}
                images={attempts}
                onSave={onSave}
                onSelect={onSelect}
              />
            ) : (
              <ImageLoading
                loading={isLoading}
                images={savedImages}
                maxImages={MAX_IMAGES}
              />
            )}
          </View>
          <ImagePrompt
            prompt={prompt}
            setPrompt={setPrompt}
            attempts={attempts}
            maxAttempts={MAX_ATTEMPTS}
            onDraw={onDraw}
            disabled={savedImages.length === MAX_IMAGES}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default Draw;
