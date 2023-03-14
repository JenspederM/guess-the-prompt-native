import {GameType} from '../../types';

export enum CustomGameStageEnum {
  STARTING = 'Starting',
  DRAWING = 'Drawing',
  GUESSING = 'Guessing',
  RANKING = 'Ranking',
  SUMMARY = 'Summary',
  FINISHED = 'Finished',
}

export type CustomGameType = GameType & {
  gameStyle: 'custom';
  imagesPerPlayer: number;
  stage: CustomGameStageEnum;
};
