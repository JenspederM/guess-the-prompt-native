import React from 'react';
import {useAtom} from 'jotai';
import {StyleSheet, View} from 'react-native';
import {Button, IconButton, Menu, useTheme} from 'react-native-paper';
import {SafeAreaView, SafeAreaViewProps} from 'react-native-safe-area-context';
import {getLogger} from '../utils/logging';
import {themeAliasAtom, userAtom} from '../atoms';
import {useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import {setUserTheme} from '../utils/firebase';
import Divider from './Divider';

type BackButtonProps = {
  label: string;
  onPress?: () => void;
};

const BackButton = ({onPress, label}: BackButtonProps) => {
  const navigation = useNavigation();
  const theme = useTheme();

  const _onPress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.goBack();
    }
  };

  if (!onPress && !navigation.canGoBack()) {
    return null;
  }

  return (
    <Button
      icon="chevron-left"
      mode="text"
      textColor={theme.colors.secondary}
      onPress={_onPress}>
      {label}
    </Button>
  );
};

const Settings = () => {
  const [showMenu, setShowMenu] = React.useState(false);
  const [themeAlias, setThemeAlias] = useAtom(themeAliasAtom);
  const [user, setUser] = useAtom(userAtom);
  const theme = useTheme();
  const logger = getLogger('Container');

  const toggleTheme = () => {
    if (!user) {
      logger.error('User is not logged in');
      setShowMenu(false);
      return;
    }
    setUserTheme(user, themeAlias === 'light' ? 'dark' : 'light');
    setThemeAlias(themeAlias === 'light' ? 'dark' : 'light');
    setShowMenu(false);
  };

  const onSignOut = async () => {
    logger.debug('Sign Out');
    await auth()
      .signOut()
      .then(() => {
        logger.info('Signed Out');
        setUser(null);
        setShowMenu(false);
      })
      .catch((error: Error) => {
        logger.error('Error signing out: ', error);
        setUser(null);
      });
    setShowMenu(false);
  };

  return (
    <Menu
      visible={showMenu}
      onDismiss={() => setShowMenu(false)}
      anchor={<IconButton icon="wrench" onPress={() => setShowMenu(true)} />}>
      <Menu.Item
        leadingIcon="theme-light-dark"
        onPress={toggleTheme}
        title={theme.dark ? 'Set Light Mode' : 'Set Dark Mode'}
      />
      <Menu.Item leadingIcon="lock" onPress={onSignOut} title="Sign Out" />
    </Menu>
  );
};

type ContainerProps = SafeAreaViewProps & {
  showSettings?: boolean;
  showBackButton?: boolean;
  goBackLabel?: string;
  onGoBack?: () => void;
  children: React.ReactNode;
};

export const Container = ({
  showSettings,
  showBackButton,
  onGoBack,
  goBackLabel = 'Go Back',
  children,
  ...props
}: ContainerProps) => {
  const Styles = StyleSheet.create({
    Container: {
      flexGrow: 1,
      flexDirection: 'column',
      paddingHorizontal: 24,
      paddingBottom: 48,
    },
    Header: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        showBackButton && !showSettings
          ? 'flex-start'
          : !showBackButton
          ? 'flex-end'
          : 'space-between',
    },
  });

  return (
    <SafeAreaView style={Styles.Container} {...props}>
      {showBackButton || showSettings ? (
        <View>
          <View style={Styles.Header}>
            {showBackButton && (
              <BackButton label={goBackLabel} onPress={onGoBack} />
            )}
            {showSettings && <Settings />}
          </View>
          <Divider />
        </View>
      ) : null}
      {children}
    </SafeAreaView>
  );
};
