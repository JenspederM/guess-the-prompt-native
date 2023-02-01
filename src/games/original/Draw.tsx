import React, {useEffect, useState} from 'react';
import {Game, PromptedImage} from '../../types';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {getLogger} from '../../utils';
import {
  generateImageFromPrompt,
  setPlayerReadiness,
} from '../../utils/firebase';
import {useAtomValue} from 'jotai';
import {userAtom} from '../../atoms';
import ImagePreview from '../../components/ImagePreview';
import ImageLoading from '../../components/ImageLoading';
import ImagePrompt from '../../components/ImagePrompt';
import PlayerList from '../../components/PlayerList';
import Divider from '../../components/Divider';
import firestore from '@react-native-firebase/firestore';

const logger = getLogger('Draw');

const WaitingForPlayers = ({
  game,
  savedImages,
}: {
  game: Game;
  savedImages: PromptedImage[];
}) => {
  const user = useAtomValue(userAtom);
  const [image, setImage] = useState<PromptedImage>(savedImages[0]);

  useEffect(() => {
    if (!game || !user) return;
    setPlayerReadiness(game.id, user.id, true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const Styles = StyleSheet.create({
    View: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
    },
  });

  return (
    <View style={Styles.View}>
      <PlayerList
        title="Waiting for other players"
        gameId={game.id}
        showReady
      />
      <Divider />
      <ImagePreview
        title="Your saved images"
        image={image}
        images={images}
        onSelect={onSelect}
      />
    </View>
  );
};

const Draw = ({game}: {game: Game}) => {
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
        ...image,
        playerId: user.id,
        createdAt: firestore.FieldValue.serverTimestamp(),
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
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
    },
  });

  return (
    <KeyboardAvoidingView
      style={Styles.Container}
      keyboardVerticalOffset={24}
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
  );
};

export default Draw;
