import React, {PropsWithoutRef} from 'react';
import {
  Dimensions,
  Image,
  ImageResizeMode,
  StyleSheet,
  View,
} from 'react-native';
import IconText from './IconText';
import {Button, Text} from 'react-native-paper';

const SizedImage = ({
  uri,
  title,
  text,
  width = '100%',
  buttonTitle,
  buttonMode = 'text',
  buttonIcon = 'image-text',
  onPress,
  rounded = 36,
  disabled = false,
  ...props
}: PropsWithoutRef<{
  uri: string;
  width?: string;
  title?: string;
  text?: string;
  buttonTitle?: string;
  buttonIcon?: string;
  onPress?: () => void;
  disabled?: boolean;
  rounded?: number;
  buttonMode?:
    | 'contained'
    | 'outlined'
    | 'text'
    | 'elevated'
    | 'contained-tonal'
    | undefined;
}>) => {
  const realWidth = parseInt(width.replace('%', ''), 10);
  const size = Dimensions.get('window').width * (realWidth / 100);

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'column',
      alignItems: 'center',
      width: size,
      rowGap: 4,
    },
    image: {
      alignItems: 'center',
      alignSelf: 'center',
      borderRadius: rounded,
      width: size,
      height: size,
      resizeMode: 'contain' as ImageResizeMode,
    },
    button: {
      width: size,
    },
    title: {
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container} {...props}>
      {title && (
        <Text style={styles.title} variant="titleMedium">
          {title}
        </Text>
      )}
      <Image style={styles.image} source={{uri: uri}} />
      {text && <IconText text={text} icon="image-text" />}
      {buttonTitle && onPress && (
        <View style={styles.button}>
          <Button
            disabled={disabled}
            onPress={onPress}
            mode={buttonMode}
            icon={buttonIcon}>
            {buttonTitle}
          </Button>
        </View>
      )}
    </View>
  );
};

export default SizedImage;
