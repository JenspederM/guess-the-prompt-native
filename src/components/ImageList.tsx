import React, {useRef} from 'react';
import {ScrollView, View} from 'react-native';
import {PromptedImage} from '../games/original/types';
import SizedImage from './SizedImage';
import {Divider} from 'react-native-paper';

const ImageList = ({
  images,
  maxImages,
  showPrompt,
  buttonTitle,
  onPress,
  buttonMode,
  disabled,
}: {
  images: PromptedImage[];
  maxImages?: number;
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
              disabled={
                disabled || (maxImages ? images.length >= maxImages : false)
              }
              uri={image.uri}
              width="80%"
              title={maxImages ? `${index + 1} / ${maxImages}` : `${index + 1}`}
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
