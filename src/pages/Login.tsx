import React, {useEffect} from 'react';
import {Button, Text} from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import {useSetAtom} from 'jotai';

import {Container} from '../components/Container';
import Loading from '../components/Loading';
import {userAtom, themeAliasAtom} from '../atoms';
import {getUserFromAuth} from '../utils/firebase';
import {getLogger} from '../utils';
import {View} from 'react-native';

const logger = getLogger('Login');

const Login = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const setUser = useSetAtom(userAtom);
  const setThemeAlias = useSetAtom(themeAliasAtom);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
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

  if (isLoading) return <Loading loadingText="Loading..." />;

  return (
    <Container className="items-center w-full">
      <View className="h-1/2 items-center justify-center">
        <Text variant="headlineMedium">Login</Text>
        <Text variant="headlineMedium">{}</Text>
      </View>
      <View className="gap-y-4">
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
