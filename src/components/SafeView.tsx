import {useNavigation} from '@react-navigation/native';
import React, {PropsWithChildren, useEffect} from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {Button, Snackbar, SnackbarProps} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';

const Header = ({
  showBack,
  onBack,
  showSignOut,
  backLabel = 'Go Back',
}: {
  showBack?: boolean;
  onBack?: () => void;
  showSignOut?: boolean;
  backLabel?: string;
}) => {
  const navigation = useNavigation();

  const _onBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const onSignOut = async () => {
    await auth()
      .signOut()
      .then(() => console.log('User signed out!'))
      .catch(error => {
        console.error(error);
      });
  };

  if (!showBack && !showSignOut) return null;

  return (
    <View className="flex-row items-center justify-between w-full">
      {showBack && (navigation.canGoBack() || onBack) && (
        <Button onPress={_onBack} icon="chevron-left" compact>
          {backLabel}
        </Button>
      )}
      {showSignOut && (
        <Button icon="logout" onPress={onSignOut} compact>
          Sign Out
        </Button>
      )}
    </View>
  );
};

type SafeViewProps = {
  showSignOut?: boolean;
  showBack?: boolean;
  backLabel?: string;
  onBack?: () => void;
  paddingPct?: number;
  centerItems?: boolean;
  centerContent?: boolean;
  rowGap?: number;
  columnGap?: number;
  width?: string | number;
  avoidKeyboard?: boolean;
  snackText?: string;
  setSnackText?: (text: string) => void;
  snackDuration?: number;
  snackOnDismiss?: () => void;
  snackAction?: SnackbarProps['action'];
};

const SafeView = ({
  children,
  onBack,
  backLabel,
  showSignOut = false,
  showBack = false,
  paddingPct = 0.2,
  centerItems = false,
  centerContent = false,
  width = '100%',
  rowGap = 0,
  columnGap = 0,
  avoidKeyboard = false,
  snackText = '',
  setSnackText,
  snackDuration = 3000,
  snackOnDismiss,
  ...props
}: PropsWithChildren & SafeViewProps) => {
  const insets = useSafeAreaInsets();
  const paddingX = Dimensions.get('window').width * paddingPct;
  const insetLeft = Math.max(insets.left, paddingX / 2);
  const insetRight = Math.max(insets.right, paddingX / 2);
  const [snackVisible, setSnackVisible] = React.useState(false);

  useEffect(() => {
    if (snackText !== '') {
      setSnackVisible(true);
    }
  }, [snackText]);

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
      marginBottom: 16,
      width: width,
      rowGap: rowGap,
      columnGap: columnGap,
    },
  });

  const _onDismiss = () => {
    if (snackOnDismiss) {
      snackOnDismiss();
    }
    if (setSnackText) {
      setSnackText('');
    }
    setSnackVisible(false);
  };

  return (
    <Container {...{avoidKeyboard, style: styles.container}} {...props}>
      <Header {...{showBack, showSignOut, onBack, backLabel}} />
      {children}
      {snackText && setSnackText && (
        <Snackbar
          visible={snackVisible}
          duration={snackDuration}
          onDismiss={_onDismiss}
          action={{
            label: 'Close',
            onPress: _onDismiss,
          }}>
          {snackText}
        </Snackbar>
      )}
    </Container>
  );
};

const Container = ({
  children,
  style,
  avoidKeyboard = false,
  ...props
}: PropsWithChildren<{avoidKeyboard: boolean; style: any}>) => {
  return avoidKeyboard ? (
    <KeyboardAvoidingView
      style={style}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {children}
    </KeyboardAvoidingView>
  ) : (
    <View style={style} {...props}>
      {children}
    </View>
  );
};

export default SafeView;
