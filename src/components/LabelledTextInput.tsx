import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text, TextInput} from 'react-native-paper';

const LabelledTextInput = ({
  title,
  label,
  value,
  onChangeValue,
  placeholder,
  affix,
  keyboardType,
  disabled,
}: {
  title: string;
  value: string;
  onChangeValue?: (value: string) => void;
  label?: string;
  placeholder?: string;
  affix?: string;
  keyboardType?:
    | 'default'
    | 'number-pad'
    | 'decimal-pad'
    | 'numeric'
    | 'email-address'
    | 'phone-pad';
  disabled?: boolean;
}) => {
  const Styles = StyleSheet.create({
    Container: {
      rowGap: 4,
    },
  });
  return (
    <View style={Styles.Container}>
      <Text variant="labelLarge">{title}</Text>
      <TextInput
        mode="outlined"
        label={label}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeValue}
        keyboardType={keyboardType}
        disabled={disabled}
        right={affix && <TextInput.Affix text={affix} />}
      />
    </View>
  );
};

export default LabelledTextInput;
