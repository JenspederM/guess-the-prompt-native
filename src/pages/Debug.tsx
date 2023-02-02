import React from 'react';
import {Container} from '../components/Container';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {StackListProps} from '../types';
import Guessing from '../games/original/stages/Guessing';
import Voting from '../games/original/stages/Voting';
import Summary from '../games/original/stages/Summary';

const Debug = ({}: NativeStackScreenProps<StackListProps, 'Debug'>) => {
  return <Voting game={require('../data/defaultGame.json')} />;
};

export default Debug;
