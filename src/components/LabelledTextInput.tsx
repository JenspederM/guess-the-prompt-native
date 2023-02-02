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
  icon,
  onIconPress,
  keyboardType,
  disabled,
}: {
  value: string;
  onChangeValue?: (value: string) => void;
  title?: string;
  label?: string;
  placeholder?: string;
  affix?: string;
  icon?: string;
  onIconPress?: () => void;
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
      width: '100%',
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
        right={
          (affix && <TextInput.Affix text={affix} />) ||
          (icon && <TextInput.Icon icon={icon} onPress={onIconPress} />)
        }
      />
    </View>
  );
};

export default LabelledTextInput;
