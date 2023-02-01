import React from 'react';
import {StyleSheet, View} from 'react-native';
import {usePlayers} from '../utils/firebase';
import {Chip} from 'react-native-paper';

const PlayerList = ({
  gameId,
  showReady,
}: {
  gameId: string;
  showReady?: boolean;
}) => {
  const players = usePlayers(gameId);

  const Styles = StyleSheet.create({
    Container: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    },
    Row: {
      width: '100%',
      justifyContent: 'center',
      columnGap: 8,
      flexDirection: 'row',
    },
    Chip: {
      height: 48,
    },
  });

  return (
    <View style={Styles.Container}>
      <View style={Styles.Row}>
        {players.map((player, index) => {
          if (showReady) {
            return (
              <Chip
                style={Styles.Chip}
                icon={player.isReady ? 'check' : 'close'}
                disabled={!player.isReady}
                key={index}>
                {player.name}
              </Chip>
            );
          } else {
            return (
              <Chip style={Styles.Chip} key={index}>
                {player.name}
              </Chip>
            );
          }
        })}
      </View>
    </View>
  );
};

export default PlayerList;
