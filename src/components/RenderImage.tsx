import React from 'react';
import {Button} from 'react-native-paper';
import {Dimensions, Image, StyleSheet, View} from 'react-native';
import IconText from '../components/IconText';
import {PromptedImage} from '../types';

export function RenderImage({
  item,
  buttonTitle,
  buttonIcon,
  buttonMode = 'text',
  onButtonPress,
}: {
  item: PromptedImage;
  buttonTitle?: string;
  buttonIcon?: string;
  buttonMode?:
    | 'contained'
    | 'text'
    | 'outlined'
    | 'elevated'
    | 'contained-tonal'
    | undefined;
  onButtonPress?: (image: PromptedImage) => Promise<void>;
}): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null {
  const {width} = Dimensions.get('window');

  const styles = StyleSheet.create({
    image: {
      width: width * 0.8,
      height: width * 0.8,
      borderRadius: 32,
    },
  });

  return (
    <View className="mb-4">
      <Image key={item.id} source={{uri: item.uri}} style={styles.image} />
      <IconText icon="image-text" text={item.prompt} />
      {buttonTitle && onButtonPress && (
        <Button
          icon={buttonIcon}
          mode={buttonMode}
          onPress={() => onButtonPress(item)}>
          {buttonTitle}
        </Button>
      )}
    </View>
  );
}
