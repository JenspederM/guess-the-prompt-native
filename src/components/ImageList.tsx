import React, {useRef} from 'react';
import {ScrollView, View} from 'react-native';
import {PromptedImage} from '../games/original/types';
import SizedImage from './SizedImage';
import {Divider} from 'react-native-paper';

const ImageList = ({
  images,
  showPrompt,
  buttonTitle,
  onPress,
  buttonMode,
  disabled,
}: {
  images: PromptedImage[];
  showPrompt?: boolean;
  buttonTitle?: string;
  buttonIcon?: string;
  onPress?: (image: PromptedImage) => void;
  disabled?: boolean;
  buttonMode?:
    | 'contained'
    | 'outlined'
    | 'text'
    | 'elevated'
    | 'contained-tonal'
    | undefined;
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  return (
    <ScrollView
      className="w-full mb-8"
      ref={scrollViewRef}
      onContentSizeChange={() => {
        scrollViewRef.current &&
          scrollViewRef.current.scrollToEnd({
            animated: true,
          });
      }}>
      <View>
        {images.map((image: PromptedImage, index) => (
          <View className="items-center w-full" key={image.value}>
            <SizedImage
              disabled={disabled}
              uri={image.uri}
              width="80%"
              title={`${index + 1} / ${images.length}`}
              text={showPrompt ? image.prompt : undefined}
              buttonTitle={buttonTitle}
              onPress={() => onPress && onPress(image)}
              buttonMode={buttonMode}
            />
            {index !== images.length - 1 && <Divider className="my-8 w-full" />}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default ImageList;
