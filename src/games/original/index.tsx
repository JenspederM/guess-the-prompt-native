import React, {ReactElement, useEffect, useState} from 'react';
import {OriginalGameType, OriginalGameStageEnum} from './types';
import Draw from './Draw';
import Guessing from './Guessing';
import Loading from '../../components/Loading';
import {Button, Text} from 'react-native-paper';
import {Container} from '../../components/Container';
import {useNavigation} from '@react-navigation/native';
import {getLogger, toTitleCase} from '../../utils';
import {setGameStage} from '../../utils/game';

const logger = getLogger('OriginalGame');

const Starting = ({game}: {game: OriginalGameType}) => {
  useEffect(() => {
    setTimeout(() => {
      logger.debug('Setting stage to DRAWING');
      if (game) {
        setGameStage(game.id, OriginalGameStageEnum.DRAWING);
      } else {
        logger.error('Game is undefined');
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

const Ranking = () => {
  return (
    <Container center>
      <Text variant="titleLarge">Ranking</Text>
    </Container>
  );
};
const Summary = () => {
  return (
    <Container center>
      <Text variant="titleLarge">Summary</Text>
    </Container>
  );
};
const Finished = () => {
  const navigation = useNavigation();

  return (
    <Container center>
      <Text variant="titleLarge">Finished</Text>
      <Button onPress={() => navigation.navigate('Home')}>Go to Home</Button>
    </Container>
  );
};

const OriginalGame = ({game}: {game: OriginalGameType}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [el, setEl] = useState<ReactElement>(<Starting game={game} />);

  useEffect(() => {
    if (game && game.gameStyle === 'original') {
      setIsLoading(false);
      switch (game.stage) {
        case OriginalGameStageEnum.STARTING:
          setEl(<Starting game={game} />);
          break;
        case OriginalGameStageEnum.DRAWING:
          setEl(<Draw game={game} />);
          break;
        case OriginalGameStageEnum.GUESSING:
          setEl(<Guessing game={game} />);
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
    }
  }, [game]);

  if (!game || isLoading) {
    return <Loading loadingText="Loading game..." />;
  }

  return el;
};

export default OriginalGame;
