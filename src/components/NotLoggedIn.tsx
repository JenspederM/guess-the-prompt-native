import React from 'react';
import {Container} from './Container';
import {Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

const NotLoggedIn = () => {
  const navigation = useNavigation();

  return (
    <Container center showBackButton onGoBack={() => navigation.goBack()}>
      <Text>Please login to continue</Text>
    </Container>
  );
};

export default NotLoggedIn;
