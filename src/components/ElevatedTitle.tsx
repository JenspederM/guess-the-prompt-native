import React from 'react';
import {Text} from 'react-native-paper';
import Surface from './Surface';

const ElevatedTitle = ({title}: {title: string}) => {
  return (
    <Surface className="my-4" center rounded={32}>
      <Text variant="titleMedium">{title}</Text>
    </Surface>
  );
};

export default ElevatedTitle;
