import React, {useRef, useState} from 'react';
import {
  ActivityIndicator,
  Button,
  Switch,
  Text,
  TextInput,
} from 'react-native-paper';
import {FlatList, Image, StyleSheet, View, Dimensions} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';

import {useGame} from '../GameProvider';
import {useUser} from '../AuthProvider';

import {findScenarioSetterId, firebaseGuid} from '../helpers';
import {PromptedImage} from '../types';

import {RenderDivider} from './RenderDivider';
import {RenderImage} from './RenderImage';
import ElevatedTitle from './ElevatedTitle';
import SafeView from './SafeView';
import IconText from './IconText';

const renderEmpty = (scenario: string) => {
  const styles = StyleSheet.create({
    empty: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      rowGap: 16,
    },
  });

  return (
    <View style={styles.empty}>
      <Text variant="headlineSmall">How would you draw?</Text>
      <ElevatedTitle title={scenario} />
    </View>
  );
};

export function DrawImages({
  onDraw,
  maxAttempts = 3,
}: {
  onDraw?: (prompt: string) => Promise<PromptedImage>;
  maxAttempts: number;
}) {
  const game = useGame();
  const user = useUser();

  const [prompt, setPrompt] = useState('');
  const [attempts, setAttempts] = useState<PromptedImage[]>([]);
  const [image, setImage] = useState<PromptedImage | null>(null);
  const [isDev, setIsDev] = useState(__DEV__);

  const {width} = Dimensions.get('window');

  const styles = StyleSheet.create({
    image: {
      width: width * 0.8,
      height: width * 0.8,
      borderRadius: 32,
    },
  });

  const saveImage = async (savedImage: PromptedImage) => {
    if (!game || !game.currentRound) return;

    firestore()
      .collection('games')
      .doc(game.game.id)
      .collection('rounds')
      .doc(game.currentRound.id.toString())
      .collection('images')
      .doc(savedImage.id)
      .set(savedImage);

    firestore()
      .collection('games')
      .doc(game.game.id)
      .collection('rounds')
      .doc(game.currentRound.id.toString())
      .update({
        images: firestore.FieldValue.arrayUnion(savedImage.id),
      });

    setImage(image);
  };

  const undoSaveImage = async (savedImage: PromptedImage) => {
    if (!game || !game.currentRound) return;

    firestore()
      .collection('games')
      .doc(game.game.id)
      .collection('rounds')
      .doc(game.currentRound.id.toString())
      .collection('images')
      .doc(savedImage.id)
      .delete();

    firestore()
      .collection('games')
      .doc(game.game.id)
      .collection('rounds')
      .doc(game.currentRound.id.toString())
      .update({
        images: firestore.FieldValue.arrayRemove(savedImage.id),
      });

    setImage(null);
  };

  if (!game || !game.currentRound || !user) {
    return <ActivityIndicator />;
  }

  const _draw = async (drawPrompt: string) => {
    if (!onDraw) {
      let promptedImage: PromptedImage | undefined;

      if (!isDev) {
        promptedImage = await functions()
          .httpsCallable('openai-generateImage')({
            prompt: prompt,
            userId: user.user.id,
            size: '256x256',
            isDev: __DEV__,
            response_format: 'url',
          })
          .then(res => {
            if (res.data.type === 'b64_json') {
              return {
                id: firebaseGuid(),
                type: 'b64_json',
                uri: `data:image/png;base64, ${res.data.image}`,
                createdBy: user.user.id,
                prompt: drawPrompt,
              };
            } else {
              return {
                id: firebaseGuid(),
                type: 'url',
                uri: res.data.image,
                createdBy: user.user.id,
                prompt: drawPrompt,
              };
            }
          })
          .catch(error => {
            console.log('error', error);
            return undefined;
          });
      } else {
        const idx =
          (Object.keys(game.game.players).findIndex(id => id === user.user.id) +
            1) *
          (attempts.length + 1);

        promptedImage = {
          id: firebaseGuid(),
          type: 'url',
          uri: `https://picsum.photos/id/${idx}/256/256`,
          createdBy: user.user.id,
          prompt: drawPrompt,
        };
      }

      if (!promptedImage) {
        return;
      }

      setAttempts([...attempts, promptedImage]);
      setPrompt('');

      /*
      
      */
    } else {
      const promptedImage = await onDraw(drawPrompt);
      if (!promptedImage) {
        return;
      }

      setAttempts([...attempts, promptedImage]);
      setPrompt('');
    }
  };

  if (!game) {
    return <ActivityIndicator />;
  }

  if (findScenarioSetterId(game.game) === user.user.id) {
    return (
      <SafeView centerContent centerItems rowGap={32}>
        <Text variant="titleMedium">Wait for players to draw images...</Text>
        <ActivityIndicator />
      </SafeView>
    );
  }

  if (attempts.length === 0) {
    return (
      <SafeView centerContent centerItems avoidKeyboard>
        <View className="grow items-center justify-center">
          <Text variant="headlineMedium">How would you draw?</Text>
          <ElevatedTitle title={game.currentRound.scenario} />
        </View>
        <View className="grow justify-center w-full gap-y-4">
          <TextInput
            disabled={attempts.length >= maxAttempts}
            label={`Prompt (attempt: ${attempts.length}/${maxAttempts})`}
            value={prompt}
            onChangeText={setPrompt}
            right={
              <TextInput.Icon
                disabled={!prompt || attempts.length >= maxAttempts}
                icon="draw"
                onPress={() => _draw(prompt)}
              />
            }
          />
        </View>
      </SafeView>
    );
  }

  if (image) {
    return (
      <SafeView centerItems>
        <View className="grow items justify-center gap-y-4">
          <ElevatedTitle title={game.currentRound.scenario} />
          <Image
            key={image.id}
            source={{uri: image.uri}}
            style={styles.image}
          />
          <IconText icon="image-text" text={image.prompt} />
          <Button mode="contained-tonal" onPress={() => undoSaveImage(image)}>
            Undo
          </Button>
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

  return (
    <SafeView centerItems avoidKeyboard>
      <ElevatedTitle title={game.currentRound.scenario} />
      <Images images={attempts} saveImage={saveImage} />
      <View className="w-full">
        <TextInput
          disabled={attempts.length >= maxAttempts}
          label={`Prompt (attempt: ${attempts.length}/${maxAttempts})`}
          value={prompt}
          onChangeText={setPrompt}
          right={
            <TextInput.Icon
              disabled={!prompt || attempts.length >= maxAttempts}
              icon="draw"
              onPress={() => _draw(prompt)}
            />
          }
        />
      </View>
      {__DEV__ && (
        <View>
          <Button
            onPress={() => {
              setAttempts([]);
            }}>
            Clear
          </Button>
          <View className="flex-row space-x-2">
            <Text>{isDev ? 'picsum' : 'openai'}</Text>
            <Switch value={isDev} onValueChange={setIsDev} />
          </View>
        </View>
      )}
    </SafeView>
  );
}

function Images({
  images,
  saveImage,
}: {
  images: PromptedImage[];
  saveImage: (savedImage: PromptedImage) => Promise<void>;
}) {
  const game = useGame();
  const listRef = useRef<FlatList<PromptedImage>>(null);

  if (!game || !game.currentRound) {
    return <ActivityIndicator />;
  }

  return (
    <FlatList
      ref={listRef}
      data={images || []}
      renderItem={({item}) => {
        return (
          <RenderImage
            item={item}
            buttonIcon="lock"
            buttonTitle="Save"
            onButtonPress={saveImage}
          />
        );
      }}
      ListEmptyComponent={renderEmpty(game.currentRound.scenario)}
      ItemSeparatorComponent={RenderDivider}
      keyExtractor={item => item.id}
      onContentSizeChange={() => {
        if (images.length > 0) listRef.current?.scrollToEnd({animated: true});
      }}
      onLayout={() => {
        if (images.length > 0) listRef.current?.scrollToEnd({animated: true});
      }}
    />
  );
}
