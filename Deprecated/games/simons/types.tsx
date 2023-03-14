import {GameType} from '../../types';

export enum SimonsGameStagesEnum {
  THEME = 'theme',
  DRAW = 'draw',
  VOTE = 'vote',
  ROUND_FINISH = 'round_finish',
  FINISH = 'finish',
}

export type SimonsGameType = GameType & {
  gameStyle: 'simons';
  stage: SimonsGameStagesEnum;
  numberOfRounds: number;
};

export type Round = {
  id: string;
  theme: string;
  themeSelector: string;
  isFinished: boolean;
  bestImage: string;
};
