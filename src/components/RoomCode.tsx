import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Surface, Text} from 'react-native-paper';

const RoomCode = ({roomCode}: {roomCode: string}) => {
  const Styles = StyleSheet.create({
    Container: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      rowGap: 16,
    },
    Title: {
      marginVertical: 8,
    },
    Surface: {
      width: '100%',
      paddingHorizontal: 16,
      paddingVertical: 8,
      alignItems: 'center',
    },
    Code: {},
  });
  return (
    <View style={Styles.Container}>
      <Text style={Styles.Title} variant="headlineSmall">
        Room Code
      </Text>
      <Surface style={Styles.Surface}>
        <Text style={Styles.Title} variant="titleMedium">
          {roomCode.toUpperCase()}
        </Text>
      </Surface>
    </View>
  );
};

export default RoomCode;
