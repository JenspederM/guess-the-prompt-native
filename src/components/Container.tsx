import React from 'react';
import {useAtom} from 'jotai';
import {View} from 'react-native';
import {Button, Divider, IconButton, Menu, useTheme} from 'react-native-paper';
import {SafeAreaView, SafeAreaViewProps} from 'react-native-safe-area-context';
import {getLogger} from '../utils/logging';
import {themeAliasAtom, userAtom} from '../atoms';
import {useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import {setUserTheme} from '../utils/firebase';

interface ContainerProps extends SafeAreaViewProps {
  showSettings?: boolean;
  showBackButton?: boolean;
  onGoBack?: () => void;
  children: React.ReactNode;
}

type BackButtonProps = {
  onPress?: () => void;
};

const BackButton = ({onPress}: BackButtonProps) => {
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
      Go Back
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

export const Container = ({
  showSettings,
  showBackButton,
  onGoBack,
  children,
  ...props
}: ContainerProps) => {
  let justify = 'justify-start';

  if (showBackButton && showSettings) {
    justify = 'justify-between';
  } else if (showBackButton && !showSettings) {
    justify = 'justify-start';
  } else if (!showBackButton && showSettings) {
    justify = 'justify-end';
  }

  return (
    <SafeAreaView className="flex flex-col flex-1 px-4 pb-12" {...props}>
      {showBackButton || showSettings ? (
        <>
          <View className={`flex flex-row w-full items-center ${justify}`}>
            {showBackButton && <BackButton onPress={onGoBack} />}
            {showSettings && <Settings />}
          </View>
          <Divider className="mb-4" />
        </>
      ) : null}
      {children}
    </SafeAreaView>
  );
};
