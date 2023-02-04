import React, {PropsWithChildren} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type SafeViewProps = {
  centerItems?: boolean;
  centerContent?: boolean;
};

const SafeView = ({
  children,
  centerItems = false,
  centerContent = false,
  ...props
}: PropsWithChildren & SafeViewProps) => {
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexGrow: 1,
      alignItems: centerItems ? 'center' : 'flex-start',
      justifyContent: centerContent ? 'center' : 'flex-start',
      flexDirection: 'column',
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: Math.max(insets.left, 16),
      paddingRight: Math.max(insets.right, 16),
      marginBottom: Platform.OS === 'ios' ? 0 : 64,
      width: '100%',
    },
  });

  return (
    <View style={styles.container} {...props}>
      {children}
    </View>
  );
};

export default SafeView;
