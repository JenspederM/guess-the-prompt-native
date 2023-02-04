import React, {PropsWithChildren} from 'react';
import {StyleSheet, View} from 'react-native';
import {useTheme} from 'react-native-paper';

type SurfaceProps = PropsWithChildren & {
  grow?: boolean;
  center?: boolean;
  padding?: number;
};

const Surface = ({children, grow, center, padding = 12}: SurfaceProps) => {
  const theme = useTheme();

  const Styles = StyleSheet.create({
    Surface: {
      flexGrow: grow ? 1 : 0,
      backgroundColor: theme.colors.elevation.level1,
      borderRadius: 4,
      padding: padding,
      alignItems: center ? 'center' : 'flex-start',
      justifyContent: center ? 'center' : 'flex-start',
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
      <View style={Styles.Surface}>{children}</View>
    </>
  );
};

export default Surface;
