import firestore from '@react-native-firebase/firestore';
import {Game, User} from '../types';

export async function leaveGame(game?: Game, user?: User) {
  if (!game || !user) return;

  if (game.host === user.id || Object.keys(game.players).length === 1) {
    await firestore()
      .collection('games')
      .doc(game.id)
      .update({isFinished: true});
  }

  await firestore()
    .collection('games')
    .doc(game.id)
    .update({
      [`players.${user.id}`]: firestore.FieldValue.delete(),
    });
}
