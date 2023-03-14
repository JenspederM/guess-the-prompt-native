import React from 'react';
import {ActivityIndicator, Button, Text} from 'react-native-paper';
import SafeView from '../components/SafeView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {StackListProps} from '../types';
import auth from '@react-native-firebase/auth';
import {StyleSheet, View} from 'react-native';

const Login = ({}: NativeStackScreenProps<StackListProps, 'Login'>) => {
  const [loading, setLoading] = React.useState(false);

  const onSignIn = () => {
    setLoading(true);
    auth().signInAnonymously();
    console.log('Signed in!');
  };

  const styles = StyleSheet.create({
    label: {
      flexGrow: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttons: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
  });

  if (loading) {
    return (
      <SafeView centerItems centerContent>
        <ActivityIndicator />
      </SafeView>
    );
  }

  return (
    <SafeView centerItems centerContent>
      <View style={styles.label}>
        <Text variant="headlineLarge">Guess the Prompt!</Text>
      </View>
      <View style={styles.buttons}>
        <View className="w-full">
          <Button icon="login" mode="contained" onPress={onSignIn}>
            Sign In
          </Button>
        </View>
      </View>
    </SafeView>
  );
};

export default Login;
