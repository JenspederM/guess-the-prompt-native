import React, {useEffect, useState} from 'react';
import {PromptedImage} from '../../original/types';
import {ActivityIndicator, Divider, Text} from 'react-native-paper';
import {ScrollView, View} from 'react-native';
import SizedImage from '../../../components/SizedImage';
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
import SafeView from '../../../components/SafeView';
import Surface from '../../../components/Surface';

const Vote = ({game}: {game?: SimonsGameType}) => {
  const round = useAtomValue(RoundAtom);
  const images = useAtomValue(ImagesAtom);
  const [selectedImage, setSelectedImage] = useState<PromptedImage>();
  const [lock, setLock] = useState(false);
  const setGameStage = useSetAtom(GameStageAtom);
  const [players, setPlayers] = useAtom(PlayersAtom);
  const playerId = DEFAULT_PLAYER_IDS[1];

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
      setGameStage(SimonsGameStagesEnum.ROUND_FINISH);
    }
  }, [round, players, setGameStage]);

  const vote = (image: PromptedImage) => {
    console.log('Voting for', image);
    setPlayers(prev => {
      return prev.map(player => {
        if (player.id === playerId) {
          player.isReady = true;
        }
        return player;
      });
    });
    setSelectedImage(image);
    setLock(true);
  };

  const undo = () => {
    console.log('Undoing vote');
    setPlayers(prev => {
      return prev.map(player => {
        if (player.id === playerId) {
          player.isReady = false;
        }
        return player;
      });
    });
    setSelectedImage(undefined);
    setLock(false);
  };

  if (lock && selectedImage) {
    return (
      <SafeView centerItems>
        <View className="w-80">
          <Surface center>
            <Text variant="titleMedium">{round.theme || 'Missing Theme'}</Text>
          </Surface>
        </View>
        <View className="my-8">
          <SizedImage
            uri={selectedImage.uri}
            width="80%"
            buttonTitle="Undo"
            onPress={undo}
          />
        </View>
        <View className="grow justify-center gap-y-4">
          <Text variant="labelMedium">
            Waiting for other players to vote for their favourite...
          </Text>
          <ActivityIndicator />
        </View>
      </SafeView>
    );
  }

  return (
    <SafeView centerItems>
      <View className="w-80">
        <Surface center>
          <Text variant="titleMedium">{round.theme || 'Missing Theme'}</Text>
        </Surface>
      </View>
      <ScrollView className="my-8">
        {images.length > 0 ? (
          images.map((image: PromptedImage, index) => (
            <View key={image.value}>
              <SizedImage
                uri={image.uri}
                width="80%"
                buttonTitle="Vote"
                buttonIcon="heart"
                onPress={() => vote(image)}
              />
              {index !== images.length - 1 && <Divider />}
            </View>
          ))
        ) : (
          <Text>Waiting for players to draw images...</Text>
        )}
      </ScrollView>
    </SafeView>
  );
};

export default Vote;
