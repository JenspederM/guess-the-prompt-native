import React, {useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Game, Player, StackListProps} from '../types';
import {View} from 'react-native';
import {
  Button,
  Menu,
  SegmentedButtons,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import {Container} from '../components/Container';
import {getLogger, makeString} from '../utils';
import firestore from '@react-native-firebase/firestore';
import {useAtom} from 'jotai';
import {aliasAtom, gameStyleAtom, userAtom} from '../atoms';

type joinInputs = {
  alias: string;
  roomCode: string;
};

type hostInputs = {
  alias: string;
};

type validationInputs =
  | ({type: 'join'} & joinInputs)
  | ({type: 'host'} & hostInputs);

type validationResponse = {
  isValid: boolean;
  message?: string;
};

const validateInputs = (input: validationInputs): validationResponse => {
  const validationArray = [];

  switch (input.type) {
    case 'join':
      if (!input.alias) validationArray.push('Alias');
      if (!input.roomCode) validationArray.push('Room Code');
      break;
    case 'host':
      if (!input.alias) validationArray.push('Alias');
      break;
  }

  if (validationArray.length > 0) {
    return {
      isValid: false,
      message: `Please enter a ${makeString(validationArray)}`,
    };
  }

  return {isValid: true};
};

const Play = ({navigation}: NativeStackScreenProps<StackListProps, 'Play'>) => {
  const [action, setAction] = useState('join');
  const [roomCode, setRoomCode] = useState('');
  const [alias, setAlias] = useAtom(aliasAtom);
  const [user, setUser] = useAtom(userAtom);
  const [gameStyle, setGameStyle] = useAtom(gameStyleAtom);
  const [snackbarText, setSnackbarText] = useState<string | null>(null);
  const [visibleSnackbar, setVisibleSnackbar] = useState(false);
  const theme = useTheme();
  const logger = getLogger('Play');
  const ALIAS_LIMIT = 15;

  if (!user) {
    return (
      <Container showBackButton onGoBack={() => navigation.goBack()}>
        <View className="flex flex-col justify-center items-center h-full">
          <Text>Please login to continue</Text>
        </View>
      </Container>
    );
  }

  const onDismissSnackBar = () => {
    setVisibleSnackbar(false);
  };

  const handleAliasChange = (text: string) => {
    if (text.length <= ALIAS_LIMIT) {
      setAlias(text);
    }
  };

  const handleJoin = async () => {
    const _logger = logger.m('handleJoin');
    _logger.debug('Joining game...');
    const validation = validateInputs({type: 'join', alias, roomCode});
    if (!validation.isValid) {
      setSnackbarText(validation.message || 'Something went wrong');
      setVisibleSnackbar(true);
      return;
    }

    _logger.debug('Validating room code...');
    const colidingGamesQuerySnapshot = await firestore()
      .collection('games')
      .where('isStarted', '==', false)
      .where('isExpired', '==', false)
      .where('roomCode', '==', roomCode.trim().toLowerCase())
      .get();

    if (colidingGamesQuerySnapshot.empty) {
      setSnackbarText('No game found with that room code');
      setVisibleSnackbar(true);
      logger
        .m('handleJoin')
        .debug('No game found with that room code', {roomCode});
      return;
    }

    if (colidingGamesQuerySnapshot.size > 1) {
      setSnackbarText('Multiple games found with that room code');
      setVisibleSnackbar(true);
      logger
        .m('handleJoin')
        .debug('Multiple games found with that room code', {roomCode});
      return;
    }

    const game = colidingGamesQuerySnapshot.docs.map(
      doc => doc.data() as Game,
    )[0];

    _logger.debug('Game found', {roomCode, game});

    if (game.players.includes(user.id)) {
      _logger.debug('User is already in this game');
      setSnackbarText('You are already in this game');
      setVisibleSnackbar(true);
      navigation.navigate('Lobby', {gameId: game.id});
      return;
    }

    _logger.debug('Adding user to game');
    await firestore()
      .collection('games')
      .doc(game.id)
      .update({
        players: firestore.FieldValue.arrayUnion(user.id),
      });

    _logger.debug('Adding user to game players collection');
    const player: Player = {
      name: alias,
      id: user.id,
      isHost: false,
      isReady: false,
      score: 0,
    };

    await firestore()
      .collection('games')
      .doc(game.id)
      .collection('players')
      .doc(user.id)
      .set(player);

    _logger.debug('Setting game in store');
    _logger.debug('Navigating to lobby');
    navigation.navigate('Lobby', {gameId: game.id});
  };

  const handleHost = () => {
    logger.m('handleHost').debug('Hosting game...');
    const validation = validateInputs({type: 'host', alias});
    if (!validation.isValid) {
      setSnackbarText(validation.message || 'Something went wrong');
      setVisibleSnackbar(true);
      return;
    }
    navigation.navigate('Host', {gameStyle});
  };

  const handleSubmit = async () => {
    logger.m('handleSubmit').debug('submit');
    if (action === 'join') {
      await handleJoin();
    } else {
      await handleHost();
    }

    if (!user) {
      return {
        isValid: false,
        message: 'Please login to continue',
      };
    }

    if (user.alias !== alias) {
      await firestore().collection('users').doc(user.id).update({alias});
    }

    setUser({...user, alias});
  };

  return (
    <>
      <Container
        showBackButton
        showSettings
        onGoBack={() => navigation.goBack()}>
        <View className="gap-y-6">
          <SegmentedButtons
            value={action}
            onValueChange={setAction}
            theme={theme}
            buttons={[
              {value: 'join', label: 'Join Game'},
              {value: 'host', label: 'Host Game'},
            ]}
          />
          {action === 'join' ? (
            <View>
              <Text variant="labelLarge" className="mb-1">
                Room Code
              </Text>
              <TextInput
                label="What is the room code?"
                placeholder="Capitalization doesn't matter."
                theme={theme}
                value={roomCode}
                onChangeText={text => setRoomCode(text)}
              />
            </View>
          ) : (
            <View>
              <Text variant="labelLarge" className="mb-1">
                Game Style
              </Text>
              <Menu
                visible={false}
                onDismiss={() => {}}
                anchor={
                  <Button
                    mode="contained-tonal"
                    className="h-14 items-center justify-center rounded-md">
                    More game styles coming soon!
                  </Button>
                }>
                <Menu.Item
                  title="Original"
                  onPress={() => setGameStyle('original')}
                />
                <Menu.Item
                  title="Custom"
                  onPress={() => setGameStyle('Custom')}
                />
              </Menu>
            </View>
          )}
          <View>
            <Text variant="labelLarge" className="mb-1">
              Alias
            </Text>
            <TextInput
              mode="flat"
              label="What should we call you?"
              placeholder="For example: 'John Doe'"
              theme={theme}
              value={alias}
              onChangeText={text => handleAliasChange(text)}
              right={
                <TextInput.Affix text={`${alias.length}/${ALIAS_LIMIT}`} />
              }
            />
          </View>
          <Button mode="contained" theme={theme} onPress={() => handleSubmit()}>
            {action === 'join' ? 'Join existing game!' : 'Create new game!'}
          </Button>
        </View>
      </Container>
      <Snackbar
        visible={visibleSnackbar}
        onDismiss={onDismissSnackBar}
        action={{
          label: 'Close',
          onPress: onDismissSnackBar,
        }}>
        {snackbarText}
      </Snackbar>
    </>
  );
};

export default Play;
