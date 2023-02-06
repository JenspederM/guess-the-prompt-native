import React, {useState} from 'react';
import {GameStyle} from '../types';
import {StyleSheet, View} from 'react-native';
import {Button, SegmentedButtons, Text, useTheme} from 'react-native-paper';
import {getLogger, makeString} from '../utils';
import {useAtom, useAtomValue} from 'jotai';
import {aliasAtom, gameStyleAtom, userAtom} from '../atoms';
import {useNavigation} from '@react-navigation/native';
import LabelledTextInput from '../components/LabelledTextInput';
import NotLoggedIn from '../components/NotLoggedIn';
import {joinGame} from '../utils/game';
import {useSetSnack} from '../utils/hooks';
import {setUserAlias} from '../utils/firebase';
import SafeView from '../components/SafeView';
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const logger = getLogger('Play');

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

const Join = () => {
  const _log = logger.getChildLogger('Join');
  const navigation = useNavigation();
  const user = useAtomValue(userAtom);
  const [roomCode, setRoomCode] = useState('');
  const [alias, setAlias] = useAtom(aliasAtom);
  const setSnack = useSetSnack();

  if (!user) return null;

  const handleJoin = async () => {
    _log.debug('Joining game...');

    const validation = validateInputs({type: 'join', alias, roomCode});
    if (!validation.isValid) {
      setSnack(validation.message || 'Something went wrong');
      return;
    }

    const {game, message} = await joinGame({
      roomCode,
      user,
    });

    if (!game) {
      setSnack(message || 'Something went wrong');
      return;
    }

    setUserAlias(user, alias);
    navigation.navigate('Lobby', {gameId: game.id});
  };

  const Styles = StyleSheet.create({
    Container: {
      marginTop: 16,
      width: '100%',
      rowGap: 32,
    },
  });

  return (
    <View style={Styles.Container}>
      <LabelledTextInput
        title="Room Code"
        value={roomCode}
        onChangeValue={setRoomCode}
        label="What is the room code?"
        placeholder="Capitalization does not matter"
      />
      <InputAlias {...{alias, setAlias}} />
      <Button mode="contained" onPress={handleJoin}>
        Join
      </Button>
    </View>
  );
};

const DropDownIcon = ({direction}: {direction: string}) => (
  <Icon
    name={!direction || direction === 'down' ? 'chevron-down' : 'chevron-up'}
    size={24}
    color="black"
  />
);

const Host = () => {
  const navigation = useNavigation();
  const [alias, setAlias] = useAtom(aliasAtom);
  const [gameStyle, setGameStyle] = useAtom(gameStyleAtom);
  const user = useAtomValue(userAtom);
  const setSnack = useSetSnack();
  const theme = useTheme();

  if (!user) return null;

  const styles = StyleSheet.create({
    container: {
      marginTop: 16,
      width: '100%',
      rowGap: 32,
    },
    selectBox: {
      height: 52,
      backgroundColor: theme.colors.primaryContainer,
      color: theme.colors.onPrimaryContainer,
      paddingHorizontal: 16,
      borderRadius: theme.roundness,
      overflow: 'hidden',
    },
    title: {
      marginBottom: 8,
    },
  });

  const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
      marginTop: 2,
      minHeight: 50,
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: 'grey',
      borderRadius: theme.roundness,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
      marginTop: 2,
      minHeight: 50,
      fontSize: 16,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: 'grey',
      borderRadius: theme.roundness,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
    iconContainer: {
      minHeight: 50,
      paddingRight: 16,
      justifyContent: 'center',
    },
  });

  const handleHost = () => {
    logger.m('handleHost').debug('Hosting game...');
    const validation = validateInputs({type: 'host', alias});
    if (!validation.isValid) {
      setSnack(validation.message || 'Something went wrong');
      return;
    }
    setUserAlias(user, alias);
    navigation.navigate('Host', {gameStyle});
  };

  const ALL_GAME_STYLES = [
    {label: 'Original', value: GameStyle.ORIGINAL},
    {label: 'Simons', value: GameStyle.SIMONS},
  ];

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title} variant="labelLarge">
          Game Style
        </Text>
        <RNPickerSelect
          useNativeAndroidPickerStyle={false}
          style={pickerSelectStyles}
          value={gameStyle}
          onValueChange={setGameStyle}
          items={ALL_GAME_STYLES}
          // @ts-ignore
          Icon={() => <DropDownIcon direction="down" />} // eslint-disable-line react/no-unstable-nested-components
        />
      </View>
      <InputAlias {...{alias, setAlias}} />
      <Button mode="contained" onPress={handleHost}>
        Host
      </Button>
    </View>
  );
};

const InputAlias = ({
  alias,
  setAlias,
  aliasLimit = 15,
}: {
  alias: string;
  setAlias: (value: string) => void;
  aliasLimit?: number;
}) => {
  const handleAliasChange = (text: string) => {
    if (text.length <= aliasLimit) {
      setAlias(text);
    }
  };

  return (
    <LabelledTextInput
      title="Alias"
      value={alias}
      onChangeValue={handleAliasChange}
      label="What should we call you?"
      placeholder="Your name or nickname"
      affix={`${alias.length}/${aliasLimit}`}
    />
  );
};

const Play = () => {
  const [action, setAction] = useState('join');
  const user = useAtomValue(userAtom);
  const theme = useTheme();

  if (!user) return <NotLoggedIn />;

  return (
    <SafeView showBack showSettings>
      <SegmentedButtons
        value={action}
        onValueChange={setAction}
        theme={theme}
        buttons={[
          {value: 'join', label: 'Join Game'},
          {value: 'host', label: 'Host Game'},
        ]}
      />
      {action === 'join' ? <Join /> : <Host />}
    </SafeView>
  );
};

export default Play;
