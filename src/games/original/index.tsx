import React, {ReactElement, useEffect, useState} from 'react';
import {OriginalGameType, OriginalGameStageEnum} from './types';
import Draw from './stages/Draw';
import Guessing from './stages/Guessing';
import Loading from '../../components/Loading';
import {Button, Text} from 'react-native-paper';
import {Container} from '../../components/Container';
import {useNavigation} from '@react-navigation/native';
import {getLogger, toTitleCase} from '../../utils';
import {setGameStage} from '../../utils/game';
import Voting from './stages/Voting';
import Summary from './stages/Summary';

const logger = getLogger('OriginalGame');

export const DEFAULT_IMAGE = require('../../data/defaultImage.json');

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

const Finished = ({game}: {game: OriginalGameType}) => {
  const navigation = useNavigation();
  console.log('game', game);

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
        case OriginalGameStageEnum.VOTING:
          setEl(<Voting game={game} />);
          break;
        case OriginalGameStageEnum.SUMMARY:
          setEl(<Summary game={game} />);
          break;
        case OriginalGameStageEnum.FINISHED:
          setEl(<Finished game={game} />);
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
