import React, {useEffect} from 'react';
import {ActivityIndicator, Button, Text} from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import {useSetAtom} from 'jotai';

import {Container} from '../components/Container';
import {userAtom, themeAliasAtom} from '../atoms';
import {getUserFromAuth} from '../utils/firebase';
import {getLogger} from '../utils';
import {StyleSheet, View} from 'react-native';

const logger = getLogger('Login');

const Splash = ({type}: {type: 'welcome' | 'loading'}) => {
  const Styles = StyleSheet.create({
    Text: {
      textAlign: 'center',
    },
    Loading: {
      justifyContent: 'center',
      alignItems: 'center',
      rowGap: 10,
    },
  });
  return (
    <Container center showSettings={false}>
      {type === 'welcome' ? (
        <>
          <Text style={Styles.Text} variant="titleLarge">
            Welcome to Guess the Prompt!
          </Text>
        </>
      ) : (
        <View style={Styles.Loading}>
          <Text style={Styles.Text} variant="titleLarge">
            Loading...
          </Text>
          <ActivityIndicator />
        </View>
      )}
    </Container>
  );
};

const Login = () => {
  const [isWelcome, setIsWelcome] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);
  const setUser = useSetAtom(userAtom);
  const setThemeAlias = useSetAtom(themeAliasAtom);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
      setIsWelcome(false);
    }, 3000);
  }, []);

  const onAnonymouslyButtonPress = async () => {
    await auth()
      .signInAnonymously()
      .then(async authUser => {
        getUserFromAuth(authUser.user)
          .then(user => {
            logger.debug('onAnonymouslyButtonPress', user);
            setUser(user);
            setThemeAlias(user.theme);
          })
          .catch(error => {
            logger.error(error);
          });
      })
      .catch(error => {
        if (error.code === 'auth/operation-not-allowed') {
          logger.info('Enable anonymous in your firebase console.');
        }
        logger.error(error);
      });
  };

  const onLogin = async (type: string = 'anonymously') => {
    logger.debug('onLogin', type);
    setIsLoading(true);
    switch (type) {
      case 'google':
        await onGoogleButtonPress();
        break;
      default:
        await onAnonymouslyButtonPress();
    }
  };

  async function onGoogleButtonPress() {
    logger.debug('onGoogleButtonPress');
    // Get the users ID token

    // Create a Google credential with the token

    // Sign-in the user with the credential
    setIsLoading(false);
  }

  if (isLoading) return <Splash type={isWelcome ? 'welcome' : 'loading'} />;

  const Styles = StyleSheet.create({
    TitleContainer: {
      width: '100%',
      height: '50%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    ButtonContainer: {
      width: '100%',
      rowGap: 8,
    },
  });

  return (
    <Container center>
      <View style={Styles.TitleContainer}>
        <Text variant="headlineMedium">Login</Text>
      </View>
      <View style={Styles.ButtonContainer}>
        <Button mode="contained" onPress={() => onLogin()}>
          Sign in Anonymously
        </Button>
        <Button mode="contained" onPress={() => onLogin('google')}>
          Sign in with Google
        </Button>
        <Button disabled mode="contained" onPress={() => onLogin('apple')}>
          Sign in with Apple
        </Button>
      </View>
    </Container>
  );
};

export default Login;
