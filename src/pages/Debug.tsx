import React from 'react';
import {Container} from '../components/Container';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {GameStyle, StackListProps} from '../types';
import SimonsGame from '../games/simons';
import {getDefaultGameStyle} from '../utils/game';
import {DEFAULT_PLAYER_IDS} from '../games/simons/atoms';

const Debug = ({}: NativeStackScreenProps<StackListProps, 'Debug'>) => {
  const game = getDefaultGameStyle({
    style: GameStyle.SIMONS,
    host: 'host',
  });

  game.players = DEFAULT_PLAYER_IDS;

  return (
    <Container withoutPadding>
      {game.gameStyle === 'simons' && <SimonsGame game={game} debug />}
    </Container>
  );
};

export default Debug;
