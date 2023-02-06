import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  StyleSheet,
  View,
} from 'react-native';
import {generateImageFromPrompt} from '../../original/api';
import {PromptedImage} from '../../original/types';
import {
  ActivityIndicator,
  Button,
  Divider,
  Text,
  TextInput,
} from 'react-native-paper';
import {SimonsGameStagesEnum, SimonsGameType} from '../types';
import {useAtom, useAtomValue, useSetAtom} from 'jotai';
import {
  DEFAULT_PLAYER_IDS,
  GameStageAtom,
  ImagesAtom,
  PlayersAtom,
  RoundAtom,
} from '../atoms';
import {useOnMount} from '../../../utils/hooks';
import SizedImage from '../../../components/SizedImage';
import SafeView from '../../../components/SafeView';
import Surface from '../../../components/Surface';
import {setPlayerReadiness} from '../../../utils/firebase';
import {userAtom} from '../../../atoms';
import IconText from '../../../components/IconText';

const Draw = ({game}: {game: SimonsGameType}) => {
  const MAX_ATTEMPTS = 3;
  const user = useAtomValue(userAtom);
  const round = useAtomValue(RoundAtom);
  const setGameStage = useSetAtom(GameStageAtom);
  const setImages = useSetAtom(ImagesAtom);
  const [selectedImage, setSelectedImage] = useState<PromptedImage>();
  const [lock, setLock] = useState(false);
  const [attempts, setAttempts] = React.useState<PromptedImage[]>([]);
  const [prompt, setPrompt] = React.useState('');
  const scrollViewRef = useRef<FlatList<PromptedImage>>(null);
  const [players, setPlayers] = useAtom(PlayersAtom);
  const playerId = DEFAULT_PLAYER_IDS[2];

  useOnMount(async () => {
    setPlayers(prev => {
      return prev.map(player => {
        player.isReady = false;
        return player;
      });
    });
  });

  useEffect(() => {
    if (
      players.length > 0 &&
      players.every(
        player => player.isReady || player.id === round.themeSelector,
      )
    ) {
      setGameStage(SimonsGameStagesEnum.VOTE);
    }
  }, [round, players, setGameStage]);

  const onDraw = async () => {
    Keyboard.isVisible() && Keyboard.dismiss();
    const newImage = await generateImageFromPrompt(
      `${attempts.length + 1}`,
      prompt,
      playerId,
    );
    setAttempts([...attempts, newImage]);
    setPrompt('');
    scrollViewRef.current?.scrollToEnd();
  };

  const [timeoutId, setTimeoutId] = useState<number>(-1);

  const onSave = (savedImage?: PromptedImage) => {
    if (!savedImage || !user) return;
    console.log('Saving image');
    setSelectedImage(savedImage);
    setLock(true);
    setImages(images => [...images, savedImage]);
    setPlayerReadiness(game?.id, user.id, true);
    setPlayers(prev => {
      return prev.map(player => {
        if (player.id === playerId) {
          player.isReady = true;
        }
        return player;
      });
    });

    const id = setTimeout(() => {
      setGameStage(SimonsGameStagesEnum.VOTE);
    }, 5000);

    setTimeoutId(id);
  };

  if (!scrollViewRef) {
    return null;
  }

  const undo = () => {
    if (!selectedImage || !user) return;
    console.log('Undoing save image');
    setPlayerReadiness(game?.id, user.id, false);
    setPlayers(prev => {
      return prev.map(player => {
        if (player.id === playerId) {
          player.isReady = false;
        }
        return player;
      });
    });
    setImages(images =>
      images.filter(image => image.value !== selectedImage.value),
    );
    setSelectedImage(undefined);
    setLock(false);

    if (timeoutId !== -1) {
      clearTimeout(timeoutId);
    }
  };

  if (lock && selectedImage) {
    return (
      <SafeView centerItems>
        <View className="grow items justify-center gap-y-4">
          <Surface center>
            <Text variant="titleMedium">{round.theme || 'Missing Theme'}</Text>
          </Surface>
          <SizedImage
            uri={selectedImage.uri}
            width="80%"
            buttonTitle="Undo"
            onPress={undo}
          />
        </View>
        <View className="grow justify-center gap-y-4">
          <Text variant="labelMedium">
            Waiting for other players to draw their images...
          </Text>
          <ActivityIndicator />
        </View>
      </SafeView>
    );
  }
  const size = Dimensions.get('window').width * (80 / 100);

  const renderItem = ({item, index}: {item: PromptedImage; index: number}) => {
    const styles = StyleSheet.create({
      image: {width: size, height: size, borderRadius: 24},
    });
    return (
      <View>
        <Text className="self-center">Attempt {index + 1}</Text>
        <Image key={item.value} source={{uri: item.uri}} style={styles.image} />
        {item.prompt && <IconText text={item.prompt} icon="image-text" />}
        <Button icon="heart" onPress={() => onSave(item)}>
          Select
        </Button>
      </View>
    );
  };

  const renderEmpty = () => {
    const styles = StyleSheet.create({
      container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: 16,
      },
    });
    return (
      <View style={styles.container}>
        <Text variant="headlineSmall">How would you draw?</Text>
        <View className="w-80 mb-8">
          <Surface center>
            <Text variant="titleMedium">{round.theme || 'Missing Theme'}</Text>
          </Surface>
        </View>
      </View>
    );
  };

  const renderDivider = () => {
    const styles = StyleSheet.create({
      container: {marginBottom: 32, marginTop: 16, width: '100%'},
    });
    return <Divider style={styles.container} />;
  };

  if (true) {
    return (
      <SafeView centerItems avoidKeyboard>
        {attempts.length > 0 && (
          <View className="w-80 mb-8">
            <Surface center>
              <Text variant="titleMedium">
                {round.theme || 'Missing Theme'}
              </Text>
            </Surface>
          </View>
        )}
        <FlatList
          ref={scrollViewRef}
          data={attempts}
          renderItem={renderItem}
          keyExtractor={item => item.value}
          ListEmptyComponent={renderEmpty}
          ItemSeparatorComponent={renderDivider}
          onContentSizeChange={() => {
            if (attempts.length > 0)
              scrollViewRef.current?.scrollToEnd({animated: true});
          }}
          onLayout={() => {
            if (attempts.length > 0)
              scrollViewRef.current?.scrollToEnd({animated: true});
          }}
        />
        <View className="w-80 py-4">
          <Text className="self-center" variant="labelLarge">
            Attemp {attempts.length} / {MAX_ATTEMPTS}
          </Text>
          <TextInput
            label="Draw your own"
            value={prompt}
            onChangeText={setPrompt}
            disabled={attempts.length >= MAX_ATTEMPTS}
            right={
              <TextInput.Icon
                icon="draw"
                forceTextInputFocus={false}
                onPress={onDraw}
                disabled={attempts.length >= MAX_ATTEMPTS}
              />
            }
          />
        </View>
      </SafeView>
    );
  }
};

export default Draw;
