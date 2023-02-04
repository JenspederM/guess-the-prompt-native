import React, {useEffect, useState} from 'react';
import {PromptedImage} from '../../original/types';
import {Container} from '../../../components/Container';
import {Divider, Text} from 'react-native-paper';
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

const Vote = ({game}: {game?: SimonsGameType}) => {
  console.log('game', game);
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
      <Container center>
        <View className="items-center my-8">
          <Text variant="headlineMedium">{round.theme || 'THEME MISSING'}</Text>
        </View>
        <SizedImage
          uri={selectedImage.uri}
          width="80%"
          buttonTitle="Undo"
          onPress={undo}
        />
      </Container>
    );
  }

  return (
    <>
      <View className="items-center my-8">
        <Text variant="titleMedium">{round.theme || 'THEME MISSING'}</Text>
      </View>
      <ScrollView>
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
    </>
  );
};

export default Vote;
