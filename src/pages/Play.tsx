import React, {useEffect} from 'react';
import SafeView from '../components/SafeView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Player, StackListProps} from '../types';
import {Button} from 'react-native-paper';
import {View} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {useUser} from '../AuthProvider';
import {StyledTextInput} from '../components/StyledTextInput';
import findGameByRoomCode from '../helpers/findGameByRoomCode';

const MAX_ALIAS_LENGTH = 15;

const updateAliasInFirestore = async (value: string, userId?: string) => {
  if (!userId) return;
  await firestore().collection('users').doc(userId).update({name: value});
};

const Play = ({navigation}: NativeStackScreenProps<StackListProps, 'Play'>) => {
  const [action, setAction] = React.useState<'join' | 'host'>('join');
  const [roomCode, setRoomCode] = React.useState('');
  const [alias, setAlias] = React.useState('');
  const [snack, setSnack] = React.useState<string>('');
  const user = useUser();

  useEffect(() => {
    setAlias(user?.user.name || '');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleJoin = async () => {
    if (!user || !user.user) return;
    if (!roomCode) {
      setSnack('Room code is required');
      return;
    }
    if (!alias) {
      setSnack('Alias is required');
      return;
    }

    await updateAliasInFirestore(alias, user.user.id);
    const gameId = await findGameByRoomCode(
      roomCode.toLowerCase(),
      user.user.id,
    );

    if (!gameId) {
      setSnack('Game not found');
      return;
    }

    const newPlayer: Player = {
      id: user.user.id,
      name: alias,
      score: 0,
    };

    console.log('Joining room', roomCode, 'as', alias, user.user.id, gameId);
    firestore()
      .collection('games')
      .doc(gameId)
      .set(
        {
          players: {[user.user.id]: newPlayer},
        },
        {merge: true},
      );

    navigation.navigate('Game', {gameId});
  };

  const handleHost = async () => {
    if (!user || !user.user) return;
    if (!alias) {
      setSnack('Alias is required');
      return;
    }
    await updateAliasInFirestore(alias, user.user.id);
    console.log('Hosting room as', alias);
    navigation.navigate('Host');
  };

  const handleAliasChange = (value: string) => {
    if (value.length > MAX_ALIAS_LENGTH) return;
    setAlias(value);
  };

  return (
    <SafeView snackText={snack} setSnackText={setSnack} centerItems showBack>
      <View className="flex-row space-x-2 my-4">
        <Button
          mode={action === 'join' ? 'contained-tonal' : 'outlined'}
          onPress={() => setAction('join')}>
          Join Game
        </Button>
        <Button
          mode={action === 'host' ? 'contained-tonal' : 'outlined'}
          onPress={() => setAction('host')}>
          Host Game
        </Button>
      </View>
      <View className="w-full gap-y-4">
        {action === 'join' && (
          <View>
            <StyledTextInput
              label="Room Code"
              placeholder="Enter room code"
              value={roomCode}
              setValue={setRoomCode}
            />
          </View>
        )}
        <View>
          <StyledTextInput
            label="Alias"
            value={alias}
            placeholder='Enter your alias (e.g. "John Doe")'
            setValue={handleAliasChange}
            affix={`${alias.length}/${MAX_ALIAS_LENGTH}`}
          />
        </View>
      </View>
      <View className="w-full mt-8">
        {action === 'join' ? (
          <Button mode="contained" onPress={() => handleJoin()}>
            Join Game
          </Button>
        ) : (
          <Button mode="contained" onPress={() => handleHost()}>
            Host Game
          </Button>
        )}
      </View>
    </SafeView>
  );
};

export default Play;
