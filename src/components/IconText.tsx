import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const IconText = ({
  prompt,
  mask = false,
  icon,
  iconSize = 24,
}: {
  prompt: string;
  mask?: boolean;
  icon?: string;
  iconSize?: number;
}) => {
  const Styles = StyleSheet.create({
    Container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: '100%',
      columnGap: 8,
    },
    Text: {
      textAlign: 'center',
    },
  });
  return (
    <View style={Styles.Container}>
      {icon && (
        <Text style={Styles.Text}>
          <Icon name={icon} size={iconSize} />
        </Text>
      )}
      <Text style={Styles.Text}>
        {mask ? prompt.replace(/\w/g, '*') : prompt}
      </Text>
    </View>
  );
};

export default IconText;
