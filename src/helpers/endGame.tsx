import {Game} from '../types';
import firestore from '@react-native-firebase/firestore';

export const endGame = (game: Game) => async () => {
  await firestore().collection('games').doc(game.id).update({
    isFinished: true,
  });
};
