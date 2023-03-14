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

  const Styles = StyleSheet.create({
    ImageContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      width: size,
      rowGap: 4,
    },
    Image: {
      alignItems: 'center',
      alignSelf: 'center',
      borderRadius: rounded,
      width: size - rounded,
      height: size - rounded,
      resizeMode: 'contain' as ImageResizeMode,
    },
    Button: {
      width: size,
    },
    Text: {
      textAlign: 'center',
    },
  });

  return (
    <View style={Styles.ImageContainer} {...props}>
      {title && (
        <Text style={Styles.Text} variant="titleMedium">
          {title}
        </Text>
      )}
      <Image style={Styles.Image} source={{uri: uri}} />
      {text && <IconText text={text} icon="image-text" />}
      {buttonTitle && onPress && (
        <View style={Styles.Button}>
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
