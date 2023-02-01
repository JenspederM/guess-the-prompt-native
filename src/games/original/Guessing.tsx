import React from 'react';
import {Text} from 'react-native-paper';
import {Container} from '../../components/Container';
import {OriginalGameType} from './types';

const Guessing = ({game}: {game: OriginalGameType}) => {
  console.log(game);
  return (
    <Container>
      <Text variant="titleLarge">Guessing</Text>
    </Container>
  );
};

export default Guessing;
