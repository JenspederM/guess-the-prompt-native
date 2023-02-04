import React, {ReactElement, useState} from 'react';
import {useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {StackListProps} from '../types';
import {getLogger} from '../utils';
import Loading from '../components/Loading';
import {useGame} from '../utils/hooks';

import OriginalGame from '../games/original';
import {OriginalGameType} from '../games/original/types';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import SimonsGame from '../games/simons';

const logger = getLogger('Game');

const GameScreen = ({
  route,
}: NativeStackScreenProps<StackListProps, 'Game'>) => {
  const {gameId} = route.params;
  const game = useGame(gameId);

  const [isLoading, setIsLoading] = useState(true);
  const [el, setEl] = React.useState<ReactElement>(
    <OriginalGame game={game as OriginalGameType} />,
  );

  useEffect(() => {
    if (game) {
      switch (game.gameStyle) {
        case 'custom':
          logger.debug('Custom Game');
          setEl(
            <View>
              <Text>Custom Game</Text>
            </View>,
          );
          break;
        case 'original':
          logger.debug('Defaults to Original Game');
          setEl(<OriginalGame game={game} />);
          break;
        case 'simons':
          logger.debug('Defaults to Original Game');
          setEl(<SimonsGame game={game} />);
          break;
        default:
          logger.debug('Defaults to Original Game');
          setEl(<OriginalGame game={game} />);
      }
      setIsLoading(false);
    }
  }, [game]);

  if (!game || isLoading) {
    return <Loading loadingText="Loading game..." />;
  }

  return el;
};

export default GameScreen;
