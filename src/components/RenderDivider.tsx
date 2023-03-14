import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Divider} from 'react-native-paper';

const height = 16;

const styles = StyleSheet.create({
  divider: {
    marginVertical: height,
    width: '100%',
  },
});

export const RenderDivider = ({showLine}: {showLine?: boolean}) => {
  if (!showLine) {
    return <View style={{height: height}} />;
  }
  return <Divider style={styles.divider} />;
};
