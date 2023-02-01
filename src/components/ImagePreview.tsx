import React, {useState} from 'react';
import {
  Dimensions,
  Image,
  ImageResizeMode,
  StyleSheet,
  View,
} from 'react-native';
import {PromptedImage} from '../types';
import {Button, SegmentedButtons, Text} from 'react-native-paper';
import {multiTapGuard} from '../utils';

const ImagePreview = ({
  image,
  images,
  onSelect,
  onSave,
  padding = 24,
  round = 24,
}: {
  image: PromptedImage;
  images: PromptedImage[];
  padding?: number;
  round?: number;
  onSelect: (value: string) => void;
  onSave?: () => void;
}) => {
  const DEVICE_WIDTH = Dimensions.get('window').width;
  const [isTapped, setIsTapped] = useState(false);

  const _onSave = multiTapGuard({
    fn: () => {
      onSave && onSave();
    },
    isTapped,
    setIsTapped,
  });

  const Styles = StyleSheet.create({
    Image: {
      width: DEVICE_WIDTH - padding,
      height: DEVICE_WIDTH - padding,
      resizeMode: 'contain' as ImageResizeMode,
    },
    Container: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      rowGap: 16,
    },
    ImageContainer: {
      width: '100%',
      borderRadius: round,
      overflow: 'hidden',
    },
    Button: {
      width: '100%',
    },
    ButtonContainer: {
      width: '100%',
    },
  });

  return (
    <View style={Styles.Container}>
      {images && onSelect && (
        <SegmentedButtons
          value={image.value}
          onValueChange={e => onSelect(e)}
          buttons={images.length > 1 ? images : []}
        />
      )}
      {onSave && (
        <View style={Styles.ButtonContainer}>
          <Button style={Styles.Button} mode="contained" onPress={_onSave}>
            Save {image.label}
          </Button>
        </View>
      )}
      <View style={Styles.ImageContainer}>
        <Image style={Styles.Image} source={{uri: image.uri}} />
      </View>
      <Text>Prompt: {image.prompt}</Text>
    </View>
  );
};

export default ImagePreview;
