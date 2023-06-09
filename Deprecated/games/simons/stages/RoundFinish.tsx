import React, {useState} from 'react';
import {SimonsGameType} from '../types';
import {PromptedImage} from '../../original/types';
import {useOnMount} from '../../../utils/hooks';
import {generateImageFromPrompt} from '../../original/api';
import {FlatList, StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import SizedImage from '../../../components/SizedImage';
import Surface from '../../../components/Surface';
import {useAtomValue} from 'jotai';
import {DEFAULT_PLAYERS, RoundAtom} from '../atoms';
import SafeView from '../../../components/SafeView';
import {Player} from '../../../types';

const RoundFinish = ({game}: {game?: SimonsGameType}) => {
  const round = useAtomValue(RoundAtom);
  const [image, setImage] = useState<PromptedImage>();
  const players = DEFAULT_PLAYERS.sort((a, b) => b.score - a.score);

  useOnMount(async () => {
    const newImage = await generateImageFromPrompt(
      'Best Image',
      'test prompt',
      'host',
    );
    setImage(newImage);
  });

  const renderPlayer = (player: Player) => {
    const styles = StyleSheet.create({
      container: {
        marginTop: 8,
        marginBottom: 8,
      },
    });

    return (
      <View style={styles.container}>
        <Surface key={player.id}>
          <View className="flex-row items-center">
            <View className="grow">
              <Text variant="labelMedium">{player.name}</Text>
            </View>
            <View className="flex-row items-center gap-x-2">
              <Text variant="labelMedium">Score</Text>
              <Text variant="labelMedium">{player.score}</Text>
            </View>
          </View>
        </Surface>
      </View>
    );
  };

  return (
    <SafeView centerItems>
      <View className="w-80">
        <Surface center>
          <Text variant="titleMedium">{round.theme || 'Missing Theme'}</Text>
        </Surface>
      </View>
      <View className="items-center flex-grow my-8">
        {image && <SizedImage uri={image.uri} width="80%" />}
      </View>
      <View className="w-80 flex-grow">
        <Text variant="titleLarge">Scores</Text>
        <FlatList
          data={players}
          renderItem={({item}) => renderPlayer(item)}
          keyExtractor={item => item.id}
        />
      </View>
      <View className="w-80 mt-4">
        <Button mode="contained">Next Round</Button>
      </View>
    </SafeView>
  );
};

export default RoundFinish;
