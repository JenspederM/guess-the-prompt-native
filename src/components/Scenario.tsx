import React, {useState} from 'react';
import {ActivityIndicator, Text, TextInput} from 'react-native-paper';
import {useGame} from '../GameProvider';
import SafeView from '../components/SafeView';
import {View} from 'react-native';
import firestore from '@react-native-firebase/firestore';

export const Scenario = ({isScenarioSetter}: {isScenarioSetter: boolean}) => {
  const [scenario, setScenario] = useState('');
  const game = useGame();

  if (!game || !game.currentRound) {
    return <ActivityIndicator />;
  }

  const onSend = async () => {
    if (!scenario || !game.currentRound) return;
    await firestore()
      .collection('games')
      .doc(game.game.id)
      .collection('rounds')
      .doc(game.currentRound.id.toString())
      .update({
        scenario,
      });
  };

  return (
    <SafeView centerContent centerItems>
      <View className="grow items-center justify-center">
        <Text variant="titleLarge">Set a scenario for the round</Text>
      </View>
      <View className="grow justify-center w-full">
        <TextInput
          label="Scenario"
          disabled={!isScenarioSetter}
          value={scenario}
          onChangeText={setScenario}
          right={
            <TextInput.Icon
              disabled={!scenario || !isScenarioSetter}
              icon="send"
              onPress={onSend}
            />
          }
        />
      </View>
    </SafeView>
  );
};
