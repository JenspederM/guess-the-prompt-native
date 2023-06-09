import {SetStateAction} from 'react';
import {getLogger} from './logging';

const logger = getLogger('utils');

export const DEFAULT_GAME = require('../data/defaultGame.json');
export const DEFAULT_IMAGE = require('../data/defaultImage.json');
export const DEFAULT_USER_ID = DEFAULT_GAME.players[0];
export const DEFAULT_GAME_ID = DEFAULT_GAME.id;

export const repeatArray = (arr: any[], times: number) => {
  var repeated = new Array(times).fill(arr).flat();
  return repeated;
};

export const makeString = (arr: string[]) => {
  if (arr.length === 0) return '';
  if (arr.length === 1) return arr[0];
  logger.m('makeString').debug('Making a string from an array of strings', arr);
  const firsts = arr.slice(0, arr.length - 1);
  const last = arr[arr.length - 1];
  return firsts.join(', ') + ' and ' + last;
};

export const toTitleCase = (str: string) => {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  });
};

type MultiTapGuardOptions = {
  fn: () => void;
  isTapped: boolean;
  setIsTapped: (value: SetStateAction<boolean>) => void;
  blockDuration?: number;
};

export const multiTapGuard = ({
  fn,
  isTapped,
  setIsTapped,
  blockDuration = 1000,
}: MultiTapGuardOptions) => {
  return () => {
    if (isTapped) {
      return;
    }
    setIsTapped(true);
    setTimeout(() => {
      setIsTapped(false);
    }, blockDuration);
    fn();
  };
};

export {getLogger};
