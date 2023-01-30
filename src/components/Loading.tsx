import React from 'react';
import {ActivityIndicator, Text} from 'react-native-paper';
import {Container} from './Container';
import {PropsWithChildren} from 'react';

interface LoadingProps extends PropsWithChildren {
  loadingText: string;
}

export default ({loadingText = 'Loading'}: LoadingProps) => {
  return (
    <Container showSettings={false} className="items-center justify-center">
      <Text variant="headlineMedium">{loadingText}</Text>
      <ActivityIndicator />
    </Container>
  );
};
