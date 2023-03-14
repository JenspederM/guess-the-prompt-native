import React from 'react';
import {ActivityIndicator} from 'react-native-paper';
import {useGame} from '../GameProvider';
import {Dimensions, StyleSheet} from 'react-native';
import {useUser} from '../AuthProvider';
import {DrawImages} from '../components/DrawImages';
import {findScenarioSetterId} from '../helpers';
import {Scenario} from '../components/Scenario';
import {ChooseFavourite} from '../components/ChooseFavourite';
import {RoundSummary} from '../components/RoundSummary';

const {width} = Dimensions.get('window');

export const styles = StyleSheet.create({
  image: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 32,
  },
  empty: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: 16,
  },
  divider: {
    marginBottom: 32,
    marginTop: 16,
    width: '100%',
  },
});

const SimonsGame = () => {
  const user = useUser();
  const game = useGame();

  if (!game || !user || !game.currentRound) {
    return <ActivityIndicator />;
  }

  if (!game.currentRound.scenario) {
    return (
      <Scenario
        isScenarioSetter={findScenarioSetterId(game.game) === user.user.id}
      />
    );
  }

  if (game.currentRound.images.length < game.players.length - 1) {
    return <DrawImages maxAttempts={3} />;
  }

  if (!game.currentRound.bestImage) {
    return (
      <ChooseFavourite
        isScenarioSetter={findScenarioSetterId(game.game) === user.user.id}
      />
    );
  }

  return (
    <RoundSummary
      game={game.game}
      currentRound={game.currentRound}
      user={user.user}
    />
  );
};

export default SimonsGame;
