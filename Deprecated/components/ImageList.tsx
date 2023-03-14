import React, {useRef} from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, View} from 'react-native';
import {PromptedImage} from '../games/original/types';
import SizedImage from './SizedImage';
import {Divider, TextInput} from 'react-native-paper';

const ImageList = ({
  images,
  maxImages,
  showPreviewTitle,
  onSelect,
  selectTitle,
  selectMode,
  selectIcon,
  disabled,
}: {
  images: PromptedImage[];
  maxImages?: number;
  showPreviewTitle?: boolean;
  onSelect?: (image: PromptedImage) => void;
  disabled?: boolean;
  selectTitle?: string;
  selectIcon?: string;
  selectMode?:
    | 'contained'
    | 'outlined'
    | 'text'
    | 'elevated'
    | 'contained-tonal'
    | undefined;
  prompt?: string;
  setPrompt?: (prompt: string) => void;
  onDraw?: () => void;
}) => {
  return (
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
            text={showPreviewTitle ? image.prompt : undefined}
            onPress={() => onSelect && onSelect(image)}
            buttonTitle={selectTitle}
            buttonIcon={selectIcon}
            buttonMode={selectMode}
          />

          {index !== images.length - 1 && <Divider className="my-8 w-full" />}
        </View>
      ))}
    </View>
  );
};

export default ImageList;
