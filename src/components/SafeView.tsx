import {useAtom} from 'jotai';
import React, {PropsWithChildren} from 'react';
import {KeyboardAvoidingView, Platform, StyleSheet, View} from 'react-native';
import {Button, IconButton, Menu, useTheme} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {themeAliasAtom, userAtom} from '../atoms';
import {getLogger} from '../utils';
import {setUserTheme} from '../utils/firebase';
import auth from '@react-native-firebase/auth';
import {ViewProps} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const logger = getLogger('SafeView');

type BackButtonProps = {
  label: string;
  onBack?: () => void;
};

const BackButton = ({onBack, label}: BackButtonProps) => {
  const navigation = useNavigation();
  const theme = useTheme();

  const _onPress = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      logger.error('Cannot go back');
    }
  };

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

const Header = ({
  showSettings,
  showBack,
  onBack,
  ...props
}: {
  showSettings: boolean;
  showBack: boolean;
  onBack?: () => void;
} & ViewProps) => {
  return (
    <View style={props.style}>
      {showBack && <BackButton label="Back" onBack={onBack} />}
      {showSettings && <Settings />}
    </View>
  );
};

type SafeViewProps = {
  showSettings?: boolean;
  showBack?: boolean;
  backLabel?: string;
  onBack?: () => void;
  width?: string;
  centerItems?: boolean;
  centerContent?: boolean;
  rowGap?: number;
  columnGap?: number;
  avoidKeyboard?: boolean;
};

const SafeView = ({
  children,
  showSettings = false,
  showBack = false,
  onBack,
  width = '100%',
  centerItems = false,
  centerContent = false,
  rowGap = 0,
  columnGap = 0,
  avoidKeyboard = false,
  ...props
}: PropsWithChildren & SafeViewProps) => {
  // convert percentage to number

  const insets = useSafeAreaInsets();

  const insetLeft = Math.max(insets.left, 16);
  const insetRight = Math.max(insets.right, 16);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexGrow: 1,
      alignItems: centerItems ? 'center' : 'flex-start',
      justifyContent: centerContent ? 'center' : 'flex-start',
      flexDirection: 'column',
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insetLeft,
      paddingRight: insetRight,
      marginBottom: Platform.OS === 'ios' ? 0 : 64,
      width: width,
      rowGap: rowGap,
      columnGap: columnGap,
    },
    header: {
      flexDirection: 'row',
      justifyContent:
        showBack && showSettings
          ? 'space-between'
          : showBack
          ? 'flex-start'
          : 'flex-end',
      alignItems: 'center',
      width: '100%',
    },
  });

  if (avoidKeyboard) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Header
          style={styles.header}
          showSettings={showSettings}
          showBack={showBack}
          onBack={onBack}
        />
        {children}
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container} {...props}>
      <Header
        style={styles.header}
        showSettings={showSettings}
        showBack={showBack}
        onBack={onBack}
      />
      {children}
    </View>
  );
};

export default SafeView;
