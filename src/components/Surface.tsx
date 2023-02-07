import React, {PropsWithChildren} from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import {useTheme} from 'react-native-paper';

type SurfaceProps = PropsWithChildren & {
  grow?: boolean;
  center?: boolean;
  padding?: number;
  width?: string | number;
  flexDirection?: 'row' | 'column';
  style?: StyleProp<ViewStyle>;
  className?: string;
};

const Surface = ({
  children,
  grow,
  center,
  width,
  padding = 12,
  flexDirection = 'column',
  style,
  className,
}: SurfaceProps) => {
  const theme = useTheme();
  const windowWidth = useWindowDimensions().width;

  const Styles = StyleSheet.create({
    Surface: {
      flexDirection: flexDirection,
      flexGrow: grow ? 1 : 0,
      backgroundColor: theme.colors.elevation.level1,
      borderRadius: theme.roundness,
      width: width || windowWidth * 0.8,
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
      minWidth: windowWidth * 0.33,
    },
  });

  return (
    <View
      className={className}
      style={StyleSheet.compose(Styles.Surface, style)}>
      {children}
    </View>
  );
};

export default Surface;
