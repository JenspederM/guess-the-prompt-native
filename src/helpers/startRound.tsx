import firestore from '@react-native-firebase/firestore';
import {Game, Round} from '../types';

export function startRound(game?: Game) {
  return async () => {
    if (!game) return;

    const newRound: Round = {
      id: game.round + 1,
      scenario: '',
      images: [],
      bestImage: '',
    };

    await firestore()
      .collection('games')
      .doc(game.id)
      .collection('rounds')
      .doc(newRound.id.toString())
      .set(newRound);

    await firestore().collection('games').doc(game.id).update({
      round: newRound.id,
      isStarted: true,
    });
  };
}
