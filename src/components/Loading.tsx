import React from 'react';
import {ActivityIndicator, Text} from 'react-native-paper';
import {Container} from './Container';
import {PropsWithChildren} from 'react';
import {StyleSheet} from 'react-native';

interface LoadingProps extends PropsWithChildren {
  loadingText: string;
}

export default ({loadingText = 'Loading'}: LoadingProps) => {
  const Styles = StyleSheet.create({
    Text: {
      textAlign: 'center',
    },
  });
  return (
    <Container center showSettings={false}>
      <Text style={Styles.Text} variant="headlineMedium">
        {loadingText}
      </Text>
      <ActivityIndicator />
    </Container>
  );
};
