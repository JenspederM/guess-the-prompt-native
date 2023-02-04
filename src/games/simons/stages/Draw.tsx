import React, {useEffect, useRef, useState} from 'react';
import {Keyboard, ScrollView, View} from 'react-native';
import {generateImageFromPrompt} from '../../original/api';
import {PromptedImage} from '../../original/types';
import ImagePrompt from '../../original/components/ImagePrompt';
import ImageList from '../../../components/ImageList';
import {ActivityIndicator, Text} from 'react-native-paper';
import {SimonsGameStagesEnum, SimonsGameType} from '../types';
import {useAtom, useAtomValue, useSetAtom} from 'jotai';
import {
  DEFAULT_PLAYER_IDS,
  GameStageAtom,
  ImagesAtom,
  PlayersAtom,
  RoundAtom,
} from '../atoms';
import {useOnMount} from '../../../utils/hooks';
import SizedImage from '../../../components/SizedImage';
import SafeView from '../../../components/SafeView';
import Surface from '../../../components/Surface';

const Draw = ({game}: {game?: SimonsGameType}) => {
  console.log('game', game);
  const round = useAtomValue(RoundAtom);
  const setGameStage = useSetAtom(GameStageAtom);
  const setImages = useSetAtom(ImagesAtom);
  const [selectedImage, setSelectedImage] = useState<PromptedImage>();
  const [lock, setLock] = useState(false);
  const [attempts, setAttempts] = React.useState<PromptedImage[]>([]);
  const [prompt, setPrompt] = React.useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [players, setPlayers] = useAtom(PlayersAtom);
  const playerId = DEFAULT_PLAYER_IDS[2];

  useOnMount(() => {
    setPlayers(prev => {
      return prev.map(player => {
        player.isReady = false;
        return player;
      });
    });
  });

  useEffect(() => {
    if (
      players.length > 0 &&
      players.every(
        player => player.isReady || player.id === round.themeSelector,
      )
    ) {
      setGameStage(SimonsGameStagesEnum.VOTE);
    }
  }, [round, players, setGameStage]);

  const onDraw = async () => {
    Keyboard.isVisible() && Keyboard.dismiss();
    const newImage = await generateImageFromPrompt(
      `${attempts.length + 1}`,
      prompt,
      playerId,
    );

    setAttempts([...attempts, newImage]);
    setPrompt('');
  };

  const onSave = (savedImage?: PromptedImage) => {
    if (!savedImage) return;
    console.log('Saving image');
    setSelectedImage(savedImage);
    setLock(true);
    setImages(images => [...images, savedImage]);
    setPlayers(prev => {
      return prev.map(player => {
        if (player.id === playerId) {
          player.isReady = true;
        }
        return player;
      });
    });
  };

  if (!scrollViewRef) {
    return null;
  }

  const undo = () => {
    if (!selectedImage) return;
    console.log('Undoing save image');
    setPlayers(prev => {
      return prev.map(player => {
        if (player.id === playerId) {
          player.isReady = false;
        }
        return player;
      });
    });
    setImages(images =>
      images.filter(image => image.value !== selectedImage.value),
    );
    setSelectedImage(undefined);
    setLock(false);
  };

  if (lock && selectedImage) {
    return (
      <SafeView centerItems>
        <View className="grow justify-center gap-y-4">
          <Surface center>
            <Text variant="titleMedium">{round.theme || 'Missing Theme'}</Text>
          </Surface>
          <SizedImage
            uri={selectedImage.uri}
            width="80%"
            buttonTitle="Undo"
            onPress={undo}
          />
        </View>
        <View className="grow justify-center gap-y-4">
          <Text variant="labelMedium">
            Waiting for other players to draw their images...
          </Text>
          <ActivityIndicator />
        </View>
      </SafeView>
    );
  }

  return (
    <SafeView centerItems centerContent={attempts.length === 0}>
      {attempts.length === 0 ? (
        <SafeView centerContent centerItems>
          <Text variant="titleMedium" className="my-4">
            How would you draw this?
          </Text>
          <View className="w-80">
            <Surface center>
              <Text variant="titleMedium">
                {round.theme || 'Missing Theme'}
              </Text>
            </Surface>
          </View>
        </SafeView>
      ) : (
        <>
          <View className="w-80 mb-4">
            <Surface center>
              <Text variant="titleMedium">
                {round.theme || 'Missing Theme'}
              </Text>
            </Surface>
          </View>
          <ImageList
            disabled={round.themeSelector === playerId}
            images={attempts}
            showPrompt
            buttonTitle="Select"
            buttonMode="contained-tonal"
            onPress={onSave}
          />
        </>
      )}
      {round.themeSelector !== playerId ? (
        <ImagePrompt
          prompt={prompt}
          setPrompt={setPrompt}
          onDraw={onDraw}
          attempts={attempts}
        />
      ) : (
        <Text>Waiting for players to draw their images...</Text>
      )}
    </SafeView>
  );
};

export default Draw;
