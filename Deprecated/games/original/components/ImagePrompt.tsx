import React, {SetStateAction, useEffect, useState} from 'react';
import {Keyboard, Platform, StyleSheet, View} from 'react-native';
import {Text, TextInput, useTheme} from 'react-native-paper';
import {PromptedImage} from '../types';
import {multiTapGuard} from '../../../utils';

const ImagePrompt = ({
  prompt,
  setPrompt,
  onDraw,
  attempts = [],
  disabled = false,
  maxAttempts = 3,
}: {
  prompt: string;
  setPrompt: (value: SetStateAction<string>) => void;
  onDraw?: (prompt: string) => void;
  attempts?: PromptedImage[];
  maxAttempts?: number;
  disabled?: boolean;
}) => {
  const theme = useTheme();
  const [showAttempts, setShowAttempts] = useState(true);
  const [missingAttempts, setMissingAttempts] = useState(maxAttempts);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isTapped, setIsTapped] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS !== 'android' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setShowAttempts(false);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS !== 'android' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setShowAttempts(true);
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
    setIsDisabled(disabled || isTapped || missingAttempts === 0);
  }, [disabled, prompt, isTapped, missingAttempts]);

  const _onDraw = multiTapGuard({
    fn: () => {
      onDraw && onDraw(prompt);
    },
    setIsTapped,
    isTapped,
  });

  const Styles = StyleSheet.create({
    Container: {
      width: '100%',
      rowGap: 8,
    },
    Text: {
      width: '100%',
      textAlign: 'center',
    },
  });

  return (
    <View style={Styles.Container}>
      {showAttempts && (
        <Text style={Styles.Text}>
          {`Attempts: ${missingAttempts}/${maxAttempts}`}
        </Text>
      )}
      <TextInput
        disabled={isDisabled}
        mode="outlined"
        label="Enter prompt here"
        placeholder="Click icon to draw"
        value={prompt}
        onChangeText={setPrompt}
        right={
          <TextInput.Icon
            icon="draw"
            color={() => theme.colors.primary}
            forceTextInputFocus={false}
            onPress={onDraw && _onDraw}
            disabled={isDisabled || !prompt}
          />
        }
      />
    </View>
  );
};

export default ImagePrompt;
