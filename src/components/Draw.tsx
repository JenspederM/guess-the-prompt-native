import React, {useEffect, useState} from 'react';
import {Game, Player} from '../types';
import {Dimensions, Image, ImageResizeMode, Keyboard, View} from 'react-native';
import {getLogger} from '../utils';
import {
  ActivityIndicator,
  Button,
  Chip,
  Divider,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import {firebaseGuid} from '../utils/firebase';

const logger = getLogger('Draw');
const DEVICE_WIDTH = Dimensions.get('window').width;

const ImageStyles = {
  width: DEVICE_WIDTH * 0.6,
  height: DEVICE_WIDTH * 0.6,
  resizeMode: 'contain' as ImageResizeMode,
};

type PromptedImage = {
  label: string;
  value: string;
  type: string;
  prompt: string;
  uri: string;
};

const generateImageFromPrompt = async (
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
        label: prompt,
        value: guid,
        type: 'url',
        prompt: prompt,
        uri: generationResponse.uri,
      };
    case 'b64_json':
      return {
        label: prompt,
        value: guid,
        type: 'b64_json',
        prompt: prompt,
        uri: `data:image/png;base64,${generationResponse.uri}`,
      };
    default:
      const index = Math.floor(Math.random() * 100);
      _log.debug('Image type not supported. Using picsum at index', index);
      return {
        label: prompt,
        value: guid,
        type: 'url',
        prompt: prompt,
        uri: `https://picsum.photos/id/${index}/256/256`,
      };
  }
};

const WaitingForPlayers = ({
  game,
  savedImages,
}: {
  game: Game;
  savedImages: PromptedImage[];
}) => {
  const [image, setImage] = useState<PromptedImage>(savedImages[0]);
  const [selected, setSelected] = useState(savedImages[0].value);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    logger.m('useEffect').debug('WaitingForPlayers started');

    const unsubPlayers = firestore()
      .collection('games')
      .doc(game.id)
      .collection('players')
      .onSnapshot(snapshot => {
        const newPlayers: Player[] = [];
        snapshot.forEach(doc => {
          newPlayers.push(doc.data() as Player);
        });
        logger.m('onPlayersChanged').debug('Players updated', players);
        setPlayers(newPlayers);
      });

    return () => {
      logger.m('useEffect').debug('WaitingForPlayers stopped');
      unsubPlayers();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSelect = (value: string) => {
    const selectedImage = savedImages.find(i => i.value === value);
    if (!selectedImage) return;
    setImage(selectedImage);
    setSelected(value);
  };

  return (
    <View className="flex flex-col items-center flex-1">
      <View className="flex-col items-center justify-center">
        <Text className="mb-2" variant="headlineSmall">
          Waiting for players to finish
        </Text>
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

      <Divider className="w-full my-4" />
      <View className="w-full items-center">
        <Text className="mb-2" variant="headlineSmall">
          Your saved images
        </Text>
        <View className="w-full h-12">
          <SegmentedButtons
            value={selected}
            onValueChange={e => onSelect(e)}
            buttons={
              savedImages.length > 1
                ? savedImages.map((img, idx) => {
                    return {
                      label: `Image ${idx + 1}`,
                      value: img.value,
                    };
                  })
                : []
            }
          />
        </View>
        <View>
          <Image style={ImageStyles} source={{uri: image?.uri}} />
          <Text>Prompt: {image?.prompt}</Text>
        </View>
      </View>
    </View>
  );
};

const DrawControls = ({
  onDraw,
  onSave,
  maxAttempts = 3,
  maxImages = 2,
  drawDisabled = false,
  saveDisabled = false,
}: {
  onDraw: (prompt: string) => void;
  onSave: () => void;
  maxAttempts?: number;
  maxImages?: number;
  drawDisabled?: boolean;
  saveDisabled?: boolean;
}) => {
  const theme = useTheme();
  const width = Dimensions.get('window').width;
  const [prompt, setPrompt] = useState('');
  const [missingAttempts, setMissingAttempts] = useState(maxAttempts);
  const [missingImages, setMissingImages] = useState(maxImages);
  const [doubleTapGuard, setDoubleTapGuard] = useState(false);
  const [isDrawDisabled, setIsDrawDisabled] = useState(drawDisabled);
  const [isSaveDisabled, setIsSaveDisabled] = useState(saveDisabled);

  const guardAgainstDoubleTap = (fn: () => void) => {
    return () => {
      if (doubleTapGuard) {
        return;
      }
      setDoubleTapGuard(true);
      setTimeout(() => {
        setDoubleTapGuard(false);
      }, 1000);
      fn();
    };
  };

  const _onDraw = guardAgainstDoubleTap(() => {
    onDraw(prompt);
    setMissingAttempts(missingAttempts - 1);
    setPrompt('');
  });

  const _onSave = guardAgainstDoubleTap(() => {
    onSave();
    setMissingAttempts(maxAttempts);
    setMissingImages(missingImages - 1);
    setPrompt('');
  });

  useEffect(() => {
    setIsDrawDisabled(doubleTapGuard || drawDisabled || missingAttempts === 0);
  }, [doubleTapGuard, drawDisabled, missingAttempts]);

  useEffect(() => {
    setIsSaveDisabled(doubleTapGuard || saveDisabled || missingImages === 0);
  }, [doubleTapGuard, saveDisabled, missingImages]);

  return (
    <>
      <View className="w-full pb-2">
        <TextInput
          label={'Enter a prompt to draw an image'}
          value={prompt}
          onChangeText={setPrompt}
        />
      </View>
      <View className="flex flex-row w-full justify-between">
        <View>
          <Text className="text-center">
            Attempts: {missingAttempts}/{maxAttempts}
          </Text>
          <Button
            loading={doubleTapGuard}
            disabled={isDrawDisabled}
            style={{width: width / 2 - 24}}
            onPress={_onDraw}
            mode="contained"
            buttonColor={theme.colors.secondaryContainer}
            textColor={theme.colors.secondary}>
            Draw Image
          </Button>
        </View>
        <View>
          <Text className="text-center">
            Images to draw: {missingImages}/{maxImages}
          </Text>
          <Button
            loading={doubleTapGuard}
            disabled={isSaveDisabled}
            style={{width: width / 2 - 24}}
            onPress={_onSave}
            mode="contained">
            Save Image
          </Button>
        </View>
      </View>
    </>
  );
};

const Drawing = ({game}: {game: Game}) => {
  const _log = logger.getChildLogger('Drawing');
  const MAX_ATTEMPTS = 3;
  const MAX_IMAGES = game.imagesPerPlayer;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [image, setImage] = useState<PromptedImage | null>(null);
  const [attempts, setAttempts] = useState<PromptedImage[]>([]);
  const [savedImages, setSavedImages] = useState<PromptedImage[]>([]);
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    const lastAttempt = attempts[attempts.length - 1];
    if (lastAttempt) {
      setImage(lastAttempt);
      setSelected(lastAttempt.value);
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
    setSelected(value);
    setImage(newImage);
  };

  const drawNewImage = async (prompt: string) => {
    setIsLoading(true);
    Keyboard.isVisible() && Keyboard.dismiss();
    _log.m('drawNewImage').debug('Generating new image from prompt', prompt);
    const newImage = await generateImageFromPrompt(prompt);
    setImage(newImage);
    _log.m('drawNewImage').debug('Adding new image to attempts');
    const newAttemps = [...attempts, newImage];
    _log.m('drawNewImage').debug('Adjusting state');
    setAttempts(newAttemps);
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

  return (
    <>
      <View className="flex flex-grow items-center">
        {image?.uri ? (
          <View>
            <View className="h-12">
              <SegmentedButtons
                value={selected}
                onValueChange={e => onSelect(e)}
                buttons={attempts.length > 1 ? attempts : []}
              />
            </View>
            <View>
              <Image style={ImageStyles} source={{uri: image?.uri}} />
              <Text>Prompt: {image?.prompt}</Text>
            </View>
          </View>
        ) : (
          <>
            <Text variant="titleLarge">
              {isLoading ? 'Loading...' : 'Enter a prompt to draw an image'}
            </Text>
            {isLoading && <ActivityIndicator />}
          </>
        )}
      </View>
      <View className="flex flex-col w-full justify-start items-start">
        <DrawControls
          onDraw={drawNewImage}
          onSave={saveImage}
          maxAttempts={MAX_ATTEMPTS}
          maxImages={MAX_IMAGES}
          saveDisabled={isLoading || attempts.length === 0}
          drawDisabled={isLoading || attempts.length === MAX_ATTEMPTS}
        />
      </View>
    </>
  );
};

export default Drawing;
