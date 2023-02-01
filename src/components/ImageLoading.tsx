import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import {PromptedImage} from '../types';

const ImageLoading = ({
  loading,
  images,
  maxImages,
}: {
  loading: boolean;
  images: PromptedImage[];
  maxImages: number;
}) => {
  const Styles = StyleSheet.create({
    CenteredContainer: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <View style={Styles.CenteredContainer}>
      <Text variant="titleLarge">
        {loading
          ? 'Loading...'
          : images.length === 0
          ? 'Enter a prompt to draw an image'
          : `You need to draw ${maxImages - images.length} more images`}
      </Text>
      {loading && <ActivityIndicator />}
    </View>
  );
};

export default ImageLoading;
