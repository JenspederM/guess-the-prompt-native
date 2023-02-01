import React, {useEffect, useState} from 'react';
import {Game, Player, PromptedImage} from '../types';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {getLogger} from '../utils';
import {Chip, Divider, Text} from 'react-native-paper';
import {
  firebaseGuid,
  setPlayerReadiness,
  subscribeToPlayers,
} from '../utils/firebase';
import {useAtomValue} from 'jotai';
import {userAtom} from '../atoms';
import ImagePreview from './ImagePreview';
import ImageLoading from './ImageLoading';
import ImagePrompt from './ImagePrompt';

const logger = getLogger('Draw');

const generateImageFromPrompt = async (
  label: string,
  prompt: string,
): Promise<PromptedImage> => {
  const _log = logger.getChildLogger('generateImageFromPrompt');
  _log.debug('Generating image from prompt', prompt);

  const generationResponse = {
    type: 'debug',
    uri: '',
  };

  const guid = firebaseGuid();

  switch (generationResponse.type) {
    case 'url':
      return {
        label: label,
        value: guid,
        type: 'url',
        prompt: prompt,
        uri: generationResponse.uri,
      };
    case 'b64_json':
      return {
        label: label,
        value: guid,
        type: 'b64_json',
        prompt: prompt,
        uri: `data:image/png;base64,${generationResponse.uri}`,
      };
    default:
      const index = Math.floor(Math.random() * 100);
      _log.debug('Image type not supported. Using picsum at index', index);
      return {
        label: label,
        value: guid,
        type: 'url',
        prompt: prompt,
        uri: `https://picsum.photos/id/${index}/256/256`,
      };
  }
};

const PlayerReadyList = ({gameId}: {gameId: string}) => {
  const _log = logger.getChildLogger('PlayerReadyList');
  const user = useAtomValue(userAtom);
  const [players, setPlayers] = useState<Player[]>([]);
  useEffect(() => {
    if (!gameId || !user) return;
    _log.m('useEffect').debug('WaitingForPlayers started');

    _log.m('useEffect').debug('Setting isReady to true', user);
    setPlayerReadiness(gameId, user.id, true);

    _log.m('useEffect').debug('Subscribing to players');
    const unsubPlayers = subscribeToPlayers({
      gameId: gameId,
      onNext: snapshot => {
        const newPlayers: Player[] = [];
        snapshot.forEach(doc => {
          newPlayers.push(doc.data() as Player);
        });
        logger.m('onPlayersChanged').debug('Players updated', players);
        setPlayers(newPlayers);
      },
    });

    return () => {
      logger.m('useEffect').debug('WaitingForPlayers stopped');
      unsubPlayers();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <View className="flex-col items-center justify-center">
      <View className="flex flex-row flex-wrap justify-center gap-2">
        {players.map((player, index) => {
          return (
            <Chip
              className="h-12"
              icon={player.isReady ? 'check' : 'cross'}
              selected={player.isReady}
              key={index}>
              {player.name}
            </Chip>
          );
        })}
      </View>
    </View>
  );
};

const WaitingForPlayers = ({
  game,
  savedImages,
}: {
  game: Game;
  savedImages: PromptedImage[];
}) => {
  const [image, setImage] = useState<PromptedImage>(savedImages[0]);

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
    <View className="flex flex-col items-center flex-1">
      <Text className="mb-2" variant="headlineSmall">
        Waiting for players to finish
      </Text>
      <PlayerReadyList gameId={game.id} />
      <Divider className="w-full my-4" />
      <View className="w-full items-center">
        <Text className="mb-2" variant="headlineSmall">
          Your saved images
        </Text>
        <ImagePreview image={image} images={images} onSelect={onSelect} />
      </View>
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

  const drawNewImage = async () => {
    setIsLoading(true);
    Keyboard.isVisible() && Keyboard.dismiss();
    _log.m('drawNewImage').debug('Generating new image from prompt', prompt);
    const newImage = await generateImageFromPrompt(
      `Attempt ${attempts.length + 1}`,
      prompt,
    );
    setImage(newImage);
    _log.m('drawNewImage').debug('Adding new image to attempts');
    const newAttemps = [...attempts, newImage];
    _log.m('drawNewImage').debug('Adjusting state');
    setAttempts(newAttemps);
    setPrompt('');
    setIsLoading(false);
    _log.m('drawNewImage').debug('Finished');
  };

  const saveImage = () => {
    if (!image) {
      _log.m('saveImage').debug('No image to save');
      return;
    }
    _log.m('saveImage').debug('Saving image', image?.label);
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
              onSave={saveImage}
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
          onDraw={drawNewImage}
          disabled={savedImages.length === MAX_IMAGES}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Draw;
