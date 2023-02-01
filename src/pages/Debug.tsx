import React from 'react';
import {Container} from '../components/Container';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {StackListProps} from '../types';
import Draw from '../games/original/Draw';

const Debug = ({}: NativeStackScreenProps<StackListProps, 'Debug'>) => {
  return (
    <Container>
      <Draw game={require('../data/defaultGame.json')} />
    </Container>
  );
};

export default Debug;
