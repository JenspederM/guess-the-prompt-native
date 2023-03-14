import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Text, TextInput} from 'react-native-paper';
import SafeView from '../components/SafeView';
import {Game, Player, StackListProps} from '../types';
import randomWords from 'random-words';
import {View} from 'react-native';
import {firebaseGuid} from '../helpers';
import firestore from '@react-native-firebase/firestore';
import findGameByRoomCode from '../helpers/findGameByRoomCode';
import {useUser} from '../AuthProvider';

const Host = ({navigation}: NativeStackScreenProps<StackListProps, 'Host'>) => {
  const [roomCode, setRoomCode] = React.useState('');
  const user = useUser();

  React.useEffect(() => {
    generateRoomCode();
  }, []);

  const generateRoomCode = () => {
    setRoomCode(randomWords(1)[0]);
  };

  const createGame = async () => {
    if (!user) return;
    const existingGame = await findGameByRoomCode(roomCode);
    if (existingGame) {
      console.log('Game already exists');
      return;
    }
    console.log('createGame');
    const newPlayer: Player = {
      id: user.user.id,
      name: user.user.name,
      score: 0,
    };

    const newGame: Game = {
      id: firebaseGuid(),
      roomCode: roomCode,
      type: 'simons',
      isStarted: false,
      isFinished: false,
      host: user.user.id,
      round: 0,
      createdAt: new Date().toISOString(),
      players: {[user.user.id]: newPlayer},
      rating: [],
      comments: [],
    };

    await firestore().collection('games').doc(newGame.id).set(newGame);
    navigation.navigate('Game', {gameId: newGame.id});
  };

  return (
    <SafeView showBack>
      <View className="w-full grow justify-center">
        <Text variant="labelLarge">Room Code</Text>
        <TextInput
          className="w-full"
          label={'Room Code'}
          value={roomCode}
          onChangeText={setRoomCode}
          right={<TextInput.Icon icon="refresh" onPress={generateRoomCode} />}
        />
      </View>
      <View className="grow items-center w-full">
        <Button mode="contained" onPress={createGame}>
          Create Game
        </Button>
      </View>
    </SafeView>
  );
};

export default Host;
