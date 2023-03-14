import React from 'react';
import {Text} from 'react-native-paper';
import {Player} from '../types';
import Surface from '../components/Surface';

const RenderScore = ({player}: {player: Player}) => {
  return (
    <Surface className="flex-row justify-between items-center" rounded={32}>
      <Text variant="titleMedium">⭐️</Text>
      <Text variant="titleMedium">{player.name}</Text>
      <Text variant="titleMedium">{player.score}</Text>
      <Text variant="titleMedium">⭐️</Text>
    </Surface>
  );
};

export default RenderScore;
