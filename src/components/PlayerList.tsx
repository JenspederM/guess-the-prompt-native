import React from 'react';
import {StyleSheet, View} from 'react-native';
import {usePlayers} from '../utils/hooks';
import {Chip, Text} from 'react-native-paper';
import Surface from './Surface';

const PlayerList = ({
  gameId,
  title,
  showReady,
}: {
  gameId: string;
  title?: string;
  showReady?: boolean;
}) => {
  const players = usePlayers(gameId);

  const Styles = StyleSheet.create({
    Container: {
      flexGrow: 1,
      width: '100%',
      alignItems: 'center',
      flexDirection: 'column',
    },
    Row: {
      width: '100%',
      justifyContent: 'center',
      columnGap: 8,
      flexDirection: 'row',
    },
    SurfaceContainer: {
      width: '100%',
    },
    Surface: {
      width: '100%',
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
        </Surface>
      </View>
    </View>
  );
};

export default PlayerList;
