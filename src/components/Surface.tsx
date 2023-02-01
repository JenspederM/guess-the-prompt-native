import React, {PropsWithChildren} from 'react';
import {StyleSheet, View} from 'react-native';
import {useTheme} from 'react-native-paper';

const Surface = ({children}: PropsWithChildren) => {
  const theme = useTheme();

  const Styles = StyleSheet.create({
    Surface: {
      backgroundColor: theme.colors.elevation.level1,
      borderRadius: 4,
      padding: 12,
      alignItems: 'center',
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  });

  return (
    <>
      <View style={[Styles.Surface]}>{children}</View>
    </>
  );
};

export default Surface;
