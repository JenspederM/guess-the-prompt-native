import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Surface from './Surface';

const RoomCode = ({title, roomCode}: {title?: string; roomCode: string}) => {
  const Styles = StyleSheet.create({
    Container: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      rowGap: 4,
    },
  });
  return (
    <View style={Styles.Container}>
      {title && <Text variant="labelLarge">{title}</Text>}
      <Surface>
        <Text variant="titleMedium">{roomCode.toUpperCase()}</Text>
      </Surface>
    </View>
  );
};

export default RoomCode;
