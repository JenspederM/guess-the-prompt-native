import {GameType} from '../../types';

export enum OriginalGameStageEnum {
  STARTING = 'Starting',
  DRAWING = 'Drawing',
  GUESSING = 'Guessing',
  VOTING = 'Voting',
  SUMMARY = 'Summary',
  FINISHED = 'Finished',
}

export type OriginalGameType = GameType & {
  gameStyle: 'original';
  imagesPerPlayer: number;
  stage: OriginalGameStageEnum;
  currentImage?: PromptedImage;
};

export type PromptedImageInDB = {
  id: string;
  type: string;
  prompt: string;
  uri: string;
};

export type PromptedImage = {
  icon: string;
  label: string;
  value: string;
  type: string;
  prompt: string;
  uri: string;
  createdBy: string;
};
