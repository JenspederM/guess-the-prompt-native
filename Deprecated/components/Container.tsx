import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, IconButton, Menu, Snackbar, useTheme} from 'react-native-paper';
import {SafeAreaView, SafeAreaViewProps} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import {useAtom, useAtomValue} from 'jotai';

import {getLogger} from '../utils/logging';
import {setUserTheme} from '../utils/firebase';
import {snackAtom, snackVisibleAtom, themeAliasAtom, userAtom} from '../atoms';

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
      anchor={
        <IconButton
          icon="cog"
          onPress={() => setShowMenu(true)}
          iconColor={theme.colors.secondary}
        />
      }>
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
  center?: boolean;
  snackAction?: {label: string; onPress: () => void};
  snackDuration?: number;
  withoutPadding?: boolean;
  children: React.ReactNode;
};

export const Container = ({
  showSettings,
  showBackButton,
  onGoBack,
  goBackLabel = 'Go Back',
  center,
  snackAction,
  snackDuration,
  withoutPadding,
  children,
  ...props
}: ContainerProps) => {
  const snackbarText = useAtomValue(snackAtom);
  const [visibleSnackbar, setVisibleSnackbar] = useAtom(snackVisibleAtom);

  const Styles = StyleSheet.create({
    Container: {
      flex: 1,
      flexGrow: 1,
      flexDirection: 'column',
      paddingHorizontal: withoutPadding ? 0 : 24,
      paddingBottom: withoutPadding ? 0 : 48,
      justifyContent: center ? 'center' : 'flex-start',
      alignItems: 'center',
      width: '100%',
      margin: 0,
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

  let _snackAction = {
    label: 'Close',
    onPress: () => setVisibleSnackbar(false),
  };

  if (snackAction) {
    _snackAction.label = snackAction.label;
    _snackAction.onPress = () => {
      snackAction.onPress();
      setVisibleSnackbar(false);
    };
  }

  return (
    <SafeAreaView style={Styles.Container} {...props}>
      {showBackButton || showSettings ? (
        <>
          <View style={Styles.Header}>
            {showBackButton && (
              <BackButton label={goBackLabel} onPress={onGoBack} />
            )}
            {showSettings && <Settings />}
          </View>
        </>
      ) : null}
      {children}
      <Snackbar
        duration={snackDuration || 3000}
        visible={visibleSnackbar}
        onDismiss={() => setVisibleSnackbar(false)}
        action={_snackAction}>
        {snackbarText}
      </Snackbar>
    </SafeAreaView>
  );
};
