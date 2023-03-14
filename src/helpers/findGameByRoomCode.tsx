import firestore from '@react-native-firebase/firestore';

export default async (roomCode: string, userId?: string) => {
  if (!userId) return;
  const existingGames = await firestore()
    .collection('games')
    .where('roomCode', '==', roomCode)
    .where('isFinished', '==', false)
    .where(`players.${userId}.id`, '==', userId)
    .get();

  if (existingGames.docs.length > 0) {
    const existingGame = existingGames.docs.filter(game => {
      const players = game.data().players;
      return players && players[userId];
    });
    if (existingGame.length === 0) {
      console.log('No existing games found');
    } else if (existingGame.length > 1) {
      console.log('Found multiple existing games', existingGame);
    } else {
      console.log('Found existing game', existingGame[0].id);
      return existingGame[0].id;
    }
  }

  const games = await firestore()
    .collection('games')
    .where('roomCode', '==', roomCode)
    .where('isStarted', '==', false)
    .where('isFinished', '==', false)
    .get();

  if (games.docs.length === 0) {
    console.log('No games found');
    return;
  }

  const game = games.docs[0];
  console.log('Found game', game.id);
  return game.id;
};
