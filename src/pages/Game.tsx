import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {StackListProps} from '../types';

import {
  ActivityIndicator,
  Button,
  IconButton,
  Text,
  TextInput,
} from 'react-native-paper';
import SafeView from '../components/SafeView';
import GameProvider, {useGame} from '../GameProvider';
import SimonsGame from '../games/SimonsGame';
import GameLobby from '../components/GameLobby';
import {View} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const Inner = ({
  navigation,
}: NativeStackScreenProps<StackListProps, 'Game'>) => {
  const game = useGame();
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');

  const goHome = () => {
    navigation.navigate('Home');
    firestore()
      .collection('games')
      .doc(game?.game.id)
      .update({
        rating: firestore.FieldValue.arrayUnion(rating),
        comment: firestore.FieldValue.arrayUnion(comment),
      });
  };

  if (!game) {
    return (
      <SafeView centerContent centerItems>
        <ActivityIndicator />
      </SafeView>
    );
  }

  if (game && (!game.game.isStarted || !game.currentRound)) {
    return <GameLobby />;
  }

  if (game && game.game.isFinished) {
    return (
      <SafeView centerContent centerItems>
        <View className="grow items-center justify-center">
          <Text variant="headlineLarge">Game is finished!</Text>
        </View>
        <Text>How did you like the game?</Text>
        <View className="flex-row">
          {[1, 2, 3, 4, 5].map(i => (
            <IconButton
              icon={rating >= i ? 'star' : 'star-outline'}
              key={i}
              onPress={() => setRating(i)}
            />
          ))}
        </View>
        {rating > 0 && (
          <View className="w-full items-center">
            <Text>Thank you for your feedback!</Text>
            <TextInput
              className="w-full"
              label="Do you have any comments?"
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
            />
          </View>
        )}
        <View className="grow items-center justify-center">
          <Button mode="contained" onPress={goHome}>
            Return to home
          </Button>
        </View>
      </SafeView>
    );
  }

  switch (game.game.type) {
    case 'simons':
      return <SimonsGame />;
    default:
      return (
        <SafeView centerContent centerItems>
          <Text>Unknown game type: {game.game.type}</Text>
          <ActivityIndicator />
        </SafeView>
      );
  }
};

const GameScreen = ({
  navigation,
  route,
}: NativeStackScreenProps<StackListProps, 'Game'>) => {
  const {gameId} = route.params;

  return (
    <GameProvider gameId={gameId}>
      <Inner navigation={navigation} route={route} />
    </GameProvider>
  );
};

export default GameScreen;
