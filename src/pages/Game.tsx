import React, {ReactElement, useCallback, useState} from 'react';
import {Button, Text} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import {useEffect} from 'react';
import {Container} from '../components/Container';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Game, OriginalGameStageEnum, StackListProps} from '../types';
import {getLogger, toTitleCase} from '../utils';
import Loading from '../components/Loading';
import {setGameStage} from '../utils/game';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Draw from '../components/Draw';

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
    <Container center>
      <Text variant="titleLarge">Welcome to Guess the Prompt! </Text>
      <Text>{toTitleCase(`${game?.gameStyle} edition`)}</Text>
    </Container>
  );
};

const Guessing = () => {
  return (
    <Container>
      <Text variant="titleLarge">Guessing</Text>
    </Container>
  );
};
const Ranking = () => {
  return (
    <Container>
      <Text variant="titleLarge">Ranking</Text>
    </Container>
  );
};
const Summary = () => {
  return (
    <Container>
      <Text variant="titleLarge">Summary</Text>
    </Container>
  );
};
const Finished = () => {
  const navigation = useNavigation();

  return (
    <Container>
      <Text variant="titleLarge">Finished</Text>
      <Button onPress={() => navigation.navigate('Home')}>Go to Home</Button>
    </Container>
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
          setEl(<Draw game={game} />);
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

  return el;
};

export default GameScreen;
