import {FlatList, Platform, StyleSheet, View} from 'react-native';
import React, {SetStateAction} from 'react';
import {Button, Text} from 'react-native-paper';

const DebugHeader = ({
  stages,
  setStage,
}: {
  stages: any;
  setStage: SetStateAction<any>;
}) => {
  const styles = StyleSheet.create({
    container: {
      flexGrow: 0,
      height: Platform.OS === 'android' ? 64 : undefined,
    },
  });

  const DATA = Object.keys(stages).map(stageSwitch => {
    return {
      id: stageSwitch,
      title: stageSwitch,
    };
  });

  const renderItem = ({item}: {item: any}) => (
    <View>
      <Button onPress={() => setStage(item.title.toLowerCase())}>
        <Text variant="labelMedium">{item.title}</Text>
      </Button>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={DATA}
      renderItem={renderItem}
      horizontal
    />
  );
};

export default DebugHeader;
