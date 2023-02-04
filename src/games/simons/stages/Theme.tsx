import React, {useState} from 'react';
import {View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {useAtom, useSetAtom} from 'jotai';

import LabelledTextInput from '../../../components/LabelledTextInput';
import {
  DEFAULT_PLAYER_IDS,
  GameStageAtom,
  PlayersAtom,
  RoundAtom,
} from '../atoms';
import {SimonsGameStagesEnum, SimonsGameType} from '../types';
import {useOnMount} from '../../../utils/hooks';
import SafeView from '../../../components/SafeView';

const Theme = ({game}: {game: SimonsGameType}) => {
  console.log('game', game);
  const [value, setValue] = useState('');
  const setGameStage = useSetAtom(GameStageAtom);
  const [round, setRound] = useAtom(RoundAtom);
  const setPlayers = useSetAtom(PlayersAtom);
  const playerId = DEFAULT_PLAYER_IDS[0];

  useOnMount(() => {
    setPlayers(players => {
      return players.map(player => {
        player.isReady = false;
        return player;
      });
    });
  });

  if (playerId !== round.themeSelector) {
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
      <View className="grow justify-center gap-y-1">
        <Text className="text-center" variant="headlineMedium">
          Set the theme for the round.
        </Text>
        <Text className="text-center" variant="titleSmall">
          {playerId} is the theme selector.
        </Text>
      </View>
      <View className="grow w-full gap-y-8">
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
