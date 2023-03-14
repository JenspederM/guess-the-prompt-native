import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Text} from 'react-native-paper';
import {useGame} from '../GameProvider';
import SafeView from '../components/SafeView';
import {FlatList} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {PromptedImage} from '../types';
import {RenderImage} from './RenderImage';
import ElevatedTitle from './ElevatedTitle';

export function ChooseFavourite({
  isScenarioSetter,
}: {
  isScenarioSetter: boolean;
}) {
  const game = useGame();
  const [images, setImages] = useState<PromptedImage[]>([]);

  useEffect(() => {
    if (!game || !game.currentRound) return;

    firestore()
      .collection('games')
      .doc(game.game.id)
      .collection('rounds')
      .doc(game.currentRound.id.toString())
      .collection('images')
      .get()
      .then(querySnapshot => {
        setImages(querySnapshot.docs.map(doc => doc.data() as PromptedImage));
      });
  }, [game]);

  const onChoose = async (chosenImage: PromptedImage) => {
    if (!game || !game.currentRound) return;
    console.log('choosing', chosenImage);

    firestore()
      .collection('games')
      .doc(game.game.id)
      .collection('rounds')
      .doc(game.currentRound.id.toString())
      .update({
        bestImage: chosenImage.id,
      });

    firestore()
      .collection('games')
      .doc(game.game.id)
      .update({
        [`players.${chosenImage.createdBy}.score`]:
          firestore.FieldValue.increment(5),
      });
  };

  if (!game || !game.currentRound || !images) {
    return <ActivityIndicator />;
  }

  if (!isScenarioSetter) {
    return (
      <SafeView centerItems centerContent rowGap={32}>
        <Text className="text-center" variant="titleMedium">
          Waiting for scenario setter to choose their favourite...
        </Text>
        <ActivityIndicator />
      </SafeView>
    );
  }

  return (
    <SafeView centerItems centerContent>
      <Text variant="headlineSmall">Which image best represents</Text>
      <ElevatedTitle title={game.currentRound.scenario} />
      <FlatList
        data={images}
        renderItem={({item}) => {
          return (
            <RenderImage
              item={item}
              buttonTitle="Vote"
              buttonIcon="heart"
              onButtonPress={onChoose}
            />
          );
        }}
      />
    </SafeView>
  );
}
