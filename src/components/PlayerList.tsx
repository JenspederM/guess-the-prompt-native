import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Chip, Text} from 'react-native-paper';
import Surface from './Surface';
import {Player} from '../types';

const PlayerList = ({
  players,
  title,
  showReady,
  grow,
}: {
  players: Player[];
  title?: string;
  showReady?: boolean;
  grow?: boolean;
}) => {
  const Styles = StyleSheet.create({
    Container: {
      flexGrow: grow ? 1 : 0,
      width: '80%',
      alignItems: 'center',
      flexDirection: 'column',
    },
    Row: {
      width: '80%',
      justifyContent: 'center',
      columnGap: 8,
      flexDirection: 'row',
    },
    SurfaceContainer: {
      width: '80%',
    },
    Surface: {
      width: '80%',
      paddingHorizontal: 16,
      paddingVertical: 8,
      rowGap: 8,
      columnGap: 8,
    },
    Chip: {
      height: 48,
    },
    Title: {
      marginVertical: 8,
    },
  });

  return (
    <View style={Styles.Container}>
      {title && (
        <Text style={Styles.Title} variant="headlineSmall">
          {title}
        </Text>
      )}
      <View style={Styles.SurfaceContainer}>
        <Surface>
          <View style={Styles.Row}>
            {players &&
              players.map((player, index) => {
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
        </Surface>
      </View>
    </View>
  );
};

export default PlayerList;
