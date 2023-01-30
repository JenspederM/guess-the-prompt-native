import {getLogger} from './logging';

const logger = getLogger('utils');

export const firebaseGuid = () => {
  logger.m('firebaseGuid').debug('Generating a new firebase guid');

  const CHARS =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let autoId = '';

  for (let i = 0; i < 28; i++) {
    autoId += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }

  return autoId;
};

export const makeString = (arr: string[]) => {
  if (arr.length === 0) return '';
  if (arr.length === 1) return arr[0];
  logger.m('makeString').debug('Making a string from an array of strings', arr);
  const firsts = arr.slice(0, arr.length - 1);
  const last = arr[arr.length - 1];
  return firsts.join(', ') + ' and ' + last;
};

export {getLogger};
