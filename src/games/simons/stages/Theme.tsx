import React, {useState} from 'react';
import {View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {useAtom, useAtomValue, useSetAtom} from 'jotai';

import LabelledTextInput from '../../../components/LabelledTextInput';
import {GameStageAtom, PlayersAtom, RoundAtom} from '../atoms';
import {SimonsGameStagesEnum, SimonsGameType} from '../types';
import {useOnMount} from '../../../utils/hooks';
import SafeView from '../../../components/SafeView';
import {userAtom} from '../../../atoms';

const Theme = ({game}: {game: SimonsGameType}) => {
  if (!game) console.log('game', game);
  const user = useAtomValue(userAtom);
  const [value, setValue] = useState('');
  const setGameStage = useSetAtom(GameStageAtom);
  const [round, setRound] = useAtom(RoundAtom);
  const setPlayers = useSetAtom(PlayersAtom);
  const playerName = user?.alias || '';

  useOnMount(() => {
    setPlayers(players => {
      return players.map(player => {
        player.isReady = false;
        return player;
      });
    });
  });

  if (playerName !== round.themeSelector) {
    return (
      <SafeView centerContent centerItems>
        <Text className="text-center">
          Waiting for {round.themeSelector} to set the theme...
        </Text>
      </SafeView>
    );
  }

  const onContinue = () => {
    setRound(prev => {
      prev.theme = value;
      return prev;
    });
    setGameStage(SimonsGameStagesEnum.DRAW);
    setValue('');
  };

  return (
    <SafeView centerItems centerContent>
      <View className="grow items-center justify-center gap-y-1">
        {round.themeSelector === playerName ? (
          <Text variant="headlineSmall">Set the Theme for Round {1}</Text>
        ) : (
          <Text variant="headlineSmall">
            {playerName} is the theme selector
          </Text>
        )}
      </View>
      <View className="grow w-80 gap-y-8">
        <LabelledTextInput
          title="Set a Theme"
          label="Enter your theme here"
          placeholder='e.g. "Halloween"'
          value={value}
          onChangeValue={setValue}
        />
        <Button mode="contained" onPress={onContinue}>
          Continue
        </Button>
      </View>
    </SafeView>
  );
};

export default Theme;
