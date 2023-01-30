import React, {ReactElement, useCallback, useState} from 'react';
import {ImageResizeMode, View, Image} from 'react-native';
import {Button, Text, useTheme} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import {useEffect} from 'react';
import {Container} from '../components/Container';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Game, ImageType, OriginalGameStageEnum, StackListProps} from '../types';
import {getLogger, toTitleCase} from '../utils';
import Loading from '../components/Loading';
import {setGameStage} from '../utils/game';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import jsonImage from '../data/defaultImage.json';

const logger = getLogger('Game');

const Starting = ({game}: {game: Game}) => {
  useEffect(() => {
    setTimeout(() => {
      logger.debug('Setting stage to DRAWING');
      if (game) {
        setGameStage(game.id, OriginalGameStageEnum.DRAWING);
      }
    }, 3000);
  }, [game]);

  return (
    <View className="gap-y-2 items-center">
      <Text variant="titleLarge" className="font-bold">
        Welcome to Guess the Prompt!{' '}
      </Text>
      <Text>{toTitleCase(`${game?.gameStyle} edition`)}</Text>
    </View>
  );
};

const Drawing = () => {
  const DefaultImage = jsonImage as ImageType;
  const [image, setImage] = useState<ImageType>(DefaultImage);
  const [uri, setUri] = useState<string>();
  const theme = useTheme();

  const ImageStyles = {
    width: '100%',
    height: '100%',
    resizeMode: 'contain' as ImageResizeMode,
  };

  useEffect(() => {
    if (image.type === 'url') {
      setUri(image.image);
    } else if (image.type === 'b64_json') {
      setUri(`data:image/png;base64,${image.image}`);
    } else {
      logger.error('Image type not supported');
    }
  }, [image]);

  const drawImage = () => {
    logger.debug('Drawing image');
    setImage(DefaultImage as ImageType);
  };

  return (
    <View className="flex flex-col">
      <View className="flex-1 gap-y-2">
        <Text variant="titleLarge" className="font-bold">
          Drawing
        </Text>
        <Image style={ImageStyles} source={{uri: uri}} />
      </View>
      <View>
        <Button
          mode="contained"
          onPress={drawImage}
          buttonColor={theme.colors.secondaryContainer}
          textColor={theme.colors.secondary}>
          Draw
        </Button>
        <Button mode="contained">Submit</Button>
      </View>
    </View>
  );
};
const Guessing = () => {
  return (
    <View className="gap-y-2">
      <Text variant="titleLarge" className="font-bold">
        Guessing
      </Text>
    </View>
  );
};
const Ranking = () => {
  return (
    <View className="gap-y-2">
      <Text variant="titleLarge" className="font-bold">
        Ranking
      </Text>
    </View>
  );
};
const Summary = () => {
  return (
    <View className="gap-y-2">
      <Text variant="titleLarge" className="font-bold">
        Summary
      </Text>
    </View>
  );
};
const Finished = () => {
  const navigation = useNavigation();

  return (
    <View>
      <View className="grow gap-y-2">
        <Text variant="titleLarge" className="font-bold">
          Finished
        </Text>
      </View>
      <View>
        <Button onPress={() => navigation.navigate('Home')}>Go to Home</Button>
      </View>
    </View>
  );
};

const GameScreen = ({
  navigation,
  route,
}: NativeStackScreenProps<StackListProps, 'Game'>) => {
  const {gameId} = route.params;
  const [game, setGame] = useState<Game>();
  const [isLoading, setIsLoading] = useState(true);
  const [el, setEl] = React.useState<ReactElement>();

  useFocusEffect(
    useCallback(() => {
      logger.info('Subscribing to game', gameId);
      const unsubscribe = firestore()
        .collection('games')
        .doc(gameId)
        .onSnapshot(doc => {
          if (doc && !doc.exists) {
            logger.debug('Game does not exist');
            return;
          }
          const currentGame = doc.data() as Game;
          logger.info('Game changed', currentGame);

          if (currentGame.isExpired) {
            logger.debug('Game is expired');
            navigation.navigate('Home');
            return;
          }

          if (currentGame) {
            setIsLoading(false);
            setGame(currentGame);
          }
        });

      // Unsubscribe from events when no longer in use
      return () => {
        logger.debug('onUnmount');
        setGameStage(gameId, OriginalGameStageEnum.FINISHED);
        firestore().collection('games').doc(gameId).update({
          isExpired: true,
        });
        unsubscribe();
      };
    }, [gameId, navigation]),
  );

  useEffect(() => {
    if (!game) {
      setIsLoading(true);
    } else {
      switch (game?.stage) {
        case OriginalGameStageEnum.STARTING:
          setEl(<Starting game={game} />);
          break;
        case OriginalGameStageEnum.DRAWING:
          setEl(<Drawing />);
          break;
        case OriginalGameStageEnum.GUESSING:
          setEl(<Guessing />);
          break;
        case OriginalGameStageEnum.RANKING:
          setEl(<Ranking />);
          break;
        case OriginalGameStageEnum.SUMMARY:
          setEl(<Summary />);
          break;
        case OriginalGameStageEnum.FINISHED:
          setEl(<Finished />);
          break;
        default:
          setEl(<Starting game={game} />);
          break;
      }

      return () => {
        setEl(<Starting game={game} />);
      };
    }
  }, [game]);

  if (isLoading) {
    return <Loading loadingText="Loading game..." />;
  }

  return <Container showSettings>{el}</Container>;
};

export default GameScreen;
