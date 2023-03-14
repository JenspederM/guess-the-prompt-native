import React, {useEffect} from 'react';
import {ActivityIndicator, Button, Text} from 'react-native-paper';
import SafeView from '../components/SafeView';
import {FlatList, View} from 'react-native';
import {Game, Player, PromptedImage, Round, User} from '../types';
import firestore from '@react-native-firebase/firestore';
import SizedImage from './SizedImage';
import {startRound} from '../helpers/startRound';
import RenderScore from './RenderScore';
import {RenderDivider} from './RenderDivider';
import {endGame} from '../helpers/endGame';
import ElevatedTitle from './ElevatedTitle';

export function RoundSummary({
  game,
  user,
  currentRound,
}: {
  game?: Game;
  user?: User;
  currentRound?: Round;
}) {
  const [image, setImage] = React.useState<PromptedImage | null>(null);
  const [winner, setWinner] = React.useState<Player>();

  useEffect(() => {
    if (!game || !currentRound || !currentRound.bestImage) return;

    firestore()
      .collection('games')
      .doc(game.id)
      .collection('rounds')
      .doc(currentRound.id.toString())
      .collection('images')
      .doc(currentRound.bestImage)
      .get()
      .then(doc => {
        if (doc.exists) {
          setImage(doc.data() as PromptedImage);
        }
      });
  }, [game, currentRound]);

  useEffect(() => {
    if (!image) return;

    const winnerObj = Object.values(game?.players || {}).find(
      player => player.id === image.createdBy,
    );

    setWinner(winnerObj);
  }, [game?.players, image]);

  if (!game || !currentRound || !image || !winner || !user) {
    return <ActivityIndicator />;
  }

  return (
    <SafeView centerItems>
      <ElevatedTitle title={currentRound.scenario} />
      <View className="grow justify-center items-center">
        <SizedImage width="80%" uri={image.uri} text={image.prompt} />
      </View>
      <Text className="text-center" variant="titleLarge">
        Scores
      </Text>
      <FlatList
        style={{width: '100%'}}
        centerContent
        contentContainerStyle={{alignItems: 'center', paddingVertical: 8}}
        key={game.id}
        data={Object.values(game.players).sort((a, b) => b.score - a.score)}
        keyExtractor={item => item.id}
        renderItem={({item}) => <RenderScore player={item} />}
        ItemSeparatorComponent={RenderDivider}
      />
      {game.host === user.id && (
        <View className="w-full gap-y-4">
          <Button mode="contained" onPress={startRound(game)}>
            Start new round
          </Button>
          <Button mode="contained-tonal" onPress={endGame(game)}>
            End Game
          </Button>
        </View>
      )}
    </SafeView>
  );
}
