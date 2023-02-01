import {GameType} from '../../types';

export enum OriginalGameStageEnum {
  STARTING = 'Starting',
  DRAWING = 'Drawing',
  GUESSING = 'Guessing',
  RANKING = 'Ranking',
  SUMMARY = 'Summary',
  FINISHED = 'Finished',
}

export type OriginalGameType = GameType & {
  gameStyle: 'original';
  imagesPerPlayer: number;
  stage: OriginalGameStageEnum;
  currentImage: string;
};
