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
import {multiTapGuard} from '../../../utils';

const ImagePreview = ({
  image,
  images,
  onSelect,
  title,
  onSave,
  withoutPrompt = false,
  maskPrompt = false,
  padding = 24,
  round = 24,
  grow = false,
  center = true,
}: {
  image: PromptedImage;
  images?: PromptedImage[];
  onSelect?: (value: string) => void;
  title?: string;
  onSave?: () => void;
  withoutPrompt?: boolean;
  maskPrompt?: boolean;
  padding?: number;
  round?: number;
  grow?: boolean;
  center?: boolean;
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
      justifyContent: center ? 'center' : 'flex-start',
      alignItems: center ? 'center' : 'flex-start',
      rowGap: 16,
      flexGrow: grow ? 1 : 0,
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
    Title: {
      marginVertical: 8,
    },
  });

  return (
    <View style={Styles.Container}>
      {title && (
        <Text style={Styles.Title} variant="headlineSmall">
          {title}
        </Text>
      )}
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
      {withoutPrompt ? null : maskPrompt ? (
        <Text>{image.prompt.replace(/\w+/g, '*')}</Text>
      ) : (
        <Text>{image.prompt}</Text>
      )}
    </View>
  );
};

export default ImagePreview;
