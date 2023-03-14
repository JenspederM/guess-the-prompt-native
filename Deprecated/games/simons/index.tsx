import React, {useState} from 'react';
import {SimonsGameStagesEnum} from './types';

import Loading from '../../components/Loading';
import DebugHeader from '../../components/DebugHeader';
import SafeView from '../../components/SafeView';
import {setThemeSelector, startRound, useCurrentRound} from '../../types/game';
import {Button, Text} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import {useAtomValue} from 'jotai';
import {userAtom} from '../../atoms';
import Theme from './stages/Theme';

const SimonsGame = ({
  gameId,
  debug = false,
}: {
  gameId: string;
  debug?: boolean;
}) => {
  const user = useAtomValue(userAtom);
  const {game, round} = useCurrentRound(gameId);
  const [currentStage, setCurrentStage] = useState<SimonsGameStagesEnum>();

  if (!debug) {
    return <Loading loadingText="Loading game..." />;
  }

  const startNewRound = async () => {
    startRound(gameId).then(async () => {
      await setThemeSelector(gameId);
      setCurrentStage(SimonsGameStagesEnum.THEME);
    });
  };

  const onContinueFromTheme = async (theme: string) => {
    if (!game) return;

    await firestore()
      .collection('games')
      .doc(gameId)
      .collection('rounds')
      .doc(game.round.toString())
      .update({
        theme: theme,
      });

    setCurrentStage(SimonsGameStagesEnum.DRAW);
  };

  if (game && game.round === 0) {
    return (
      <SafeView centerContent centerItems>
        <Button onPress={startNewRound}>Start Round</Button>
      </SafeView>
    );
  }

  if ((!round || !user) && round?.themeSelector === user?.id) {
    return (
      <SafeView showSettings showBack>
        {debug && (
          <DebugHeader
            stages={SimonsGameStagesEnum}
            setStage={setCurrentStage}
          />
        )}
        <Text>{round?.themeSelector} is choosing a theme for this round</Text>
      </SafeView>
    );
  }

  if (currentStage === SimonsGameStagesEnum.THEME) {
    return <Theme onContinue={onContinueFromTheme} />;
  }

  return (
    <SafeView showSettings showBack>
      {debug && (
        <DebugHeader stages={SimonsGameStagesEnum} setStage={setCurrentStage} />
      )}
    </SafeView>
  );
};

export default SimonsGame;
