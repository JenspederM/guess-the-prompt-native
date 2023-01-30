import {atom} from 'jotai';
import {GameStyle, Player, User} from './types';

export const themeAliasAtom = atom<string>('light');
export const userAtom = atom<User | null>(null);

export const aliasAtom = atom<string>('');
export const roomCodeAtom = atom<string>('');

export const gameAtom = atom<GameStyle | null>(null);
export const gameStyleAtom = atom<string>('original');
export const playersAtom = atom<Player[]>([]);
