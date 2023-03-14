import React from 'react';
import {Text, TextInput, TextInputProps} from 'react-native-paper';
import {View} from 'react-native';

export const StyledTextInput = ({
  label,
  value,
  setValue,
  placeholder,
  affix,
  icon,
}: TextInputProps & {
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  affix?: string;
  icon?: string;
}) => {
  let right;
  if (affix) {
    right = <TextInput.Affix text={affix} />;
  } else if (icon) {
    right = <TextInput.Icon icon={icon} />;
  }

  return (
    <View className="w-full gap-y-2">
      <Text variant="labelLarge">{label}</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        right={right}
      />
    </View>
  );
};
