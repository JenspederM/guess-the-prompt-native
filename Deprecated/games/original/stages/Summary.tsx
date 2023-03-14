import React from 'react';
import {Text} from 'react-native-paper';
import {Container} from '../../../components/Container';
import {OriginalGameType} from '../types';

const Summary = ({game}: {game: OriginalGameType}) => {
  console.log('game', game);
  return (
    <Container center>
      <Text variant="titleLarge">Summary</Text>
    </Container>
  );
};

export default Summary;
