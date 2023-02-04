import React, {ReactElement, useEffect, useState} from 'react';
import {SimonsGameType, SimonsGameStagesEnum} from './types';

import Loading from '../../components/Loading';
import Theme from './stages/Theme';
import Draw from './stages/Draw';
import Vote from './stages/Vote';
import RoundFinish from './stages/RoundFinish';
import Finish from './stages/Finish';
import DebugHeader from '../../components/DebugHeader';
import {useAtom, useSetAtom} from 'jotai';
import {DEFAULT_PLAYER_IDS, GameStageAtom, RoundAtom} from './atoms';
import {useOnMount} from '../../utils/hooks';

const SimonsGame = ({
  game,
  debug = false,
}: {
  game: SimonsGameType;
  debug?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(debug ? false : true);
  const [el, setEl] = useState<ReactElement>(<Theme game={game} />);
  const [currentStage, setCurrentStage] = useAtom(GameStageAtom);
  const setRound = useSetAtom(RoundAtom);

  useOnMount(() => {
    setRound(round => {
      round.themeSelector = DEFAULT_PLAYER_IDS[0];
      return round;
    });
  });

  useEffect(() => {
    setIsLoading(false);
    switch (currentStage) {
      case SimonsGameStagesEnum.THEME:
        setEl(<Theme game={game} />);
        break;
      case SimonsGameStagesEnum.DRAW:
        setEl(<Draw game={game} />);
        break;
      case SimonsGameStagesEnum.VOTE:
        setEl(<Vote game={game} />);
        break;
      case SimonsGameStagesEnum.ROUND_FINISH:
        setEl(<RoundFinish game={game} />);
        break;
      case SimonsGameStagesEnum.FINISH:
        setEl(<Finish game={game} />);
        break;
      default:
        setEl(<Finish game={game} />);
        break;
    }
  }, [currentStage, game]);

  if (!debug && (!game || isLoading)) {
    return <Loading loadingText="Loading game..." />;
  }

  return (
    <>
      {debug && (
        <DebugHeader stages={SimonsGameStagesEnum} setStage={setCurrentStage} />
      )}
      {el}
    </>
  );
};

export default SimonsGame;
