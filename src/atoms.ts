import {atom} from 'jotai';
import {Game, Player, User} from './types';

export const themeAliasAtom = atom<string>('light');
export const userAtom = atom<User | null>(null);

export const snackAtom = atom<string>('');
export const snackVisibleAtom = atom<boolean>(false);

export const aliasAtom = atom<string>('');
export const roomCodeAtom = atom<string>('');

export const gameAtom = atom<Game | null>(null);
export const gameStyleAtom = atom<string>('original');
export const playersAtom = atom<Player[]>([]);
