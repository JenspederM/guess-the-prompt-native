import {getLogger} from './logging';

const logger = getLogger('utils');

export const makeString = (arr: string[]) => {
  if (arr.length === 0) return '';
  if (arr.length === 1) return arr[0];
  logger.m('makeString').debug('Making a string from an array of strings', arr);
  const firsts = arr.slice(0, arr.length - 1);
  const last = arr[arr.length - 1];
  return firsts.join(', ') + ' and ' + last;
};

export {getLogger};
