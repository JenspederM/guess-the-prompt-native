import {atom} from 'jotai';
import {User} from './types';

export const themeAliasAtom = atom<string>('light');
export const userAtom = atom<User | null>(null);
