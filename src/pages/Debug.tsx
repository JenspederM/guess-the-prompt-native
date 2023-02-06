import React from 'react';
import {Container} from '../components/Container';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {GameStyle, StackListProps} from '../types';
import SimonsGame from '../games/simons';
import {getDefaultGameStyle} from '../utils/game';
import {createGame} from '../utils/firebase';
import {useAtomValue} from 'jotai';
import {userAtom} from '../atoms';

const Debug = ({}: NativeStackScreenProps<StackListProps, 'Debug'>) => {
  const user = useAtomValue(userAtom);

  if (!user) {
    return null;
  }

  const game = getDefaultGameStyle({
    style: GameStyle.SIMONS,
    host: user.id,
  });

  createGame(game, user);

  return game.gameStyle === 'simons' ? <SimonsGame game={game} debug /> : null;
};

export default Debug;
