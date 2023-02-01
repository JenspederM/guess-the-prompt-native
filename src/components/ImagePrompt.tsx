import React, {SetStateAction, useEffect, useState} from 'react';
import {Keyboard, Platform, StyleSheet, View} from 'react-native';
import {Text, TextInput, useTheme} from 'react-native-paper';
import {PromptedImage} from '../types';
import {multiTapGuard} from '../utils';

const ImagePrompt = ({
  prompt,
  setPrompt,
  onDraw,
  disabled,
  attempts,
  maxAttempts,
}: {
  prompt: string;
  setPrompt: (value: SetStateAction<string>) => void;
  onDraw: (prompt: string) => void;
  disabled: boolean;
  attempts: PromptedImage[];
  maxAttempts: number;
}) => {
  const theme = useTheme();
  const [showAttempts, setShowAttempts] = useState(true);
  const [missingAttempts, setMissingAttempts] = useState(maxAttempts);
  const [isDrawDisabled, setIsDrawDisabled] = useState(false);
  const [isTapped, setIsTapped] = useState(false);

  const _onDraw = multiTapGuard({
    fn: () => {
      onDraw(prompt);
    },
    setIsTapped,
    isTapped,
  });

  const Styles = StyleSheet.create({
    Container: {
      width: '100%',
      rowGap: 8,
      paddingTop: 16,
    },
    Text: {
      width: '100%',
      textAlign: 'center',
    },
  });

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS !== 'android' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setShowAttempts(false); // or some other action
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS !== 'android' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setShowAttempts(true); // or some other action
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    setMissingAttempts(maxAttempts - attempts.length);
  }, [attempts, maxAttempts]);

  useEffect(() => {
    setIsDrawDisabled(!prompt || isTapped || missingAttempts === 0);
  }, [prompt, isTapped, missingAttempts]);

  return (
    <View style={Styles.Container}>
      <Text style={Styles.Text}>
        {showAttempts && `Attempts: ${missingAttempts}/${maxAttempts}`}
      </Text>
      <TextInput
        disabled={disabled}
        mode="outlined"
        label={'Enter a prompt to draw an image'}
        value={prompt}
        onChangeText={setPrompt}
        right={
          <TextInput.Icon
            icon="draw"
            color={() => theme.colors.primary}
            forceTextInputFocus={false}
            onPress={_onDraw}
            disabled={isDrawDisabled}
          />
        }
      />
    </View>
  );
};

export default ImagePrompt;
