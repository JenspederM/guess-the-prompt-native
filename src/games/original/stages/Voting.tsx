import React, {useEffect} from 'react';
import {ActivityIndicator, Button, IconButton, Text} from 'react-native-paper';
import {Container} from '../../../components/Container';
import {OriginalGameType, PromptedImage} from '../types';
import {firebaseGuid} from '../../../utils/firebase';
import {DEFAULT_IMAGE} from '..';
import ImagePreview from '../components/ImagePreview';
import {usePlayers} from '../../../utils/hooks';
import Surface from '../../../components/Surface';
import {ScrollView, View} from 'react-native';
import {repeatArray} from '../../../utils';

type GuessType = {
  id: number;
  guess: string;
};

const Voting = ({game}: {game: OriginalGameType}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [image, setImage] = React.useState<PromptedImage>();
  const [guesses, setGuesses] = React.useState<GuessType[]>(); // TODO: [guesses, setGuesses] = useGuesses(game.id);
  const [favorite, setFavorite] = React.useState<GuessType>(); // TODO: [favorite, setFavorite] = useFavorite(game.id, player.id);
  const [locked, setLocked] = React.useState(false); // TODO: [locked, setLocked] = useLocked(game.id);
  const players = usePlayers(game.id);

  useEffect(() => {
    setIsLoading(true);
    const currentImage = game.currentImage || {
      label: 'Default Image',
      value: firebaseGuid(),
      type: 'b64_json',
      prompt: 'A lawn char in space',
      uri: `data:image/png;base64,${DEFAULT_IMAGE.image}`,
    };
    const currentGuesses = repeatArray(
      [
        {
          guess: 'Guess',
          playerName: 'Player',
          playerID: 'PlayerID',
        },
      ],
      10,
    ).map((guess, index) => {
      return {
        id: index,
        guess: guess.guess,
        playerName: `${guess.playerName} ${index + 1}`,
      };
    });
    setImage(currentImage);
    setGuesses(currentGuesses);
    setIsLoading(false);
  }, [game]);

  const toggleVote = (guess: GuessType) => {
    if (favorite && favorite.id === guess.id) {
      console.log('Removing vote for', guess);
      setFavorite(undefined);
      return;
    }
    console.log('Voting for', guess);
    setFavorite(guess);
  };

  const lockVotes = () => {
    console.log('Locking votes with favorite', favorite);
    setLocked(true);
  };

  const unlockVotes = () => {
    console.log('Unlocking votes and resetting favorite', favorite);
    setLocked(false);
  };

  if (isLoading) {
    return (
      <Container center>
        <Text>Loading...</Text>
        <ActivityIndicator />
      </Container>
    );
  }

  if (!image || !guesses) {
    return (
      <Container center>
        <Text>Something went wrong</Text>
      </Container>
    );
  }

  if (locked) {
    return (
      <Container center>
        <Text>Locked</Text>
        <Button onPress={() => unlockVotes()}>Unlock</Button>
      </Container>
    );
  }

  return (
    <Container showSettings>
      <Text className="mb-4" variant="headlineMedium">
        Which guess is best?
      </Text>
      {image && <ImagePreview image={image} withoutPrompt center={false} />}
      <ScrollView className="w-full my-4">
        {players &&
          guesses &&
          repeatArray(guesses, 1).map((guess, i) => {
            return (
              <View key={i} className="mb-4">
                <Surface>
                  <View className="flex-row items-center" key={guess.id}>
                    <View className="grow">
                      <Text variant="titleMedium">{guess.guess}</Text>
                      <Text>By {guess.playerName}</Text>
                    </View>
                    <IconButton
                      icon={favorite === guess ? 'heart' : 'heart-outline'}
                      onPress={() => toggleVote(guess)}
                    />
                  </View>
                </Surface>
              </View>
            );
          })}
      </ScrollView>
      <View className="w-full">
        <Button
          className="mt-4"
          mode="contained-tonal"
          onPress={lockVotes}
          disabled={!favorite}>
          <Text>Lock Vote!</Text>
        </Button>
      </View>
    </Container>
  );
};

export default Voting;
