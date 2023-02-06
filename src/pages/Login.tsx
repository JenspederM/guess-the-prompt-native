import React, {useEffect} from 'react';
import {ActivityIndicator, Button, Text} from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import {useAtom, useSetAtom} from 'jotai';

import {userAtom, themeAliasAtom} from '../atoms';
import {getUserFromAuth} from '../utils/firebase';
import {getLogger} from '../utils';
import {StyleSheet, View} from 'react-native';
import SafeView from '../components/SafeView';

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
    <SafeView centerContent centerItems>
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
    </SafeView>
  );
};

const Login = () => {
  const [isWelcome, setIsWelcome] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [user, setUser] = useAtom(userAtom);
  const setThemeAlias = useSetAtom(themeAliasAtom);

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
      setIsWelcome(false);
    }, 3000);
  }, []);

  const onAnonymouslyButtonPress = async () => {
    setIsLoading(true);
    await auth()
      .signInAnonymously()
      .then(async authUser => {
        getUserFromAuth(authUser.user)
          .then(LoginUser => {
            logger.debug('onAnonymouslyButtonPress', LoginUser);
            setUser(LoginUser);
            setThemeAlias(LoginUser.theme);
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
    setIsLoading(false);
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

  if (isWelcome || isLoading)
    return <Splash type={isWelcome ? 'welcome' : 'loading'} />;

  const styles = StyleSheet.create({
    TitleContainer: {
      flexGrow: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    ButtonContainer: {
      flexGrow: 1,
      width: '80%',
      justifyContent: 'center',
      rowGap: 16,
    },
    button: {
      width: '100%',
    },
  });

  return (
    <SafeView centerContent centerItems>
      <View style={styles.TitleContainer}>
        <Text variant="headlineMedium">Login</Text>
      </View>
      <View style={styles.ButtonContainer}>
        <Button mode="contained" onPress={() => onLogin()}>
          Sign in Anonymously
        </Button>
        <Button disabled mode="contained" onPress={() => onLogin('google')}>
          Sign in with Google
        </Button>
        <Button disabled mode="contained" onPress={() => onLogin('apple')}>
          Sign in with Apple
        </Button>
      </View>
    </SafeView>
  );
};

export default Login;
