import React from 'react';
import {StyleSheet} from 'react-native';
import {Divider as PaperDivider} from 'react-native-paper';

const Divider = () => {
  const Styles = StyleSheet.create({
    Divider: {
      marginVertical: 16,
    },
  });
  return <PaperDivider style={Styles.Divider} />;
};

export default Divider;
