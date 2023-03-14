import {
  Dimensions,
  Image,
  ImageResizeMode,
  Keyboard,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import React, {useRef} from 'react';
import {PromptedImage} from '../types';
import {generateImageFromPrompt} from '../api';
import {useOnMount} from '../../../utils/hooks';
import {Button, Divider, Text} from 'react-native-paper';
import {Container} from '../../../components/Container';
import Surface from '../../../components/Surface';
import ImagePrompt from './ImagePrompt';
import LabelledTextInput from '../../../components/LabelledTextInput';
import {atom, useAtom} from 'jotai';
import {repeatArray} from '../../../utils';
import SizedImage from '../../../components/SizedImage';
import {GameType} from '../../../types';

const DEVICE_WIDTH = Dimensions.get('window').width;
const gap = 32;
const size = DEVICE_WIDTH * 0.8; // 80% of the screen width

const Styles = StyleSheet.create({
  Container: {
    marginVertical: gap,
    width: '100%',
    rowGap: gap,
  },
  ImageContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    rowGap: 4,
  },
  RoundedImage: {
    width: size,
    borderRadius: 24,
    overflow: 'hidden',
  },
  Image: {
    width: size,
    height: size,
    resizeMode: 'contain' as ImageResizeMode,
  },
  Text: {
    marginVertical: 16,
  },
});

const Draw = () => {
  const [image, setImage] = React.useState<PromptedImage>();
  const [attempts, setAttempts] = React.useState<PromptedImage[]>([]);
  const [prompt, setPrompt] = React.useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const onDraw = async () => {
    Keyboard.isVisible() && Keyboard.dismiss();
    const newImage = await generateImageFromPrompt(
      `${attempts.length + 1}`,
      prompt,
    );

    setImage(newImage);
    setAttempts([...attempts, newImage]);
    setPrompt('');
  };

  const onSave = (savedImage?: PromptedImage) => {
    if (!savedImage) return;
    setAttempts([]);
    console.log('image', savedImage);
  };

  if (!scrollViewRef) {
    return null;
  }

  const DrawStyles = StyleSheet.create({
    ScrollView: {
      width: '100%',
      marginVertical: gap,
    },
    ItemContainer: {
      width: '100%',
      rowGap: gap,
    },
    Item: {
      width: '100%',
      rowGap: 8,
    },
    ImageContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      width: size,
      rowGap: 4,
    },
    RoundedImage: {
      width: size,
      borderRadius: 24,
      overflow: 'hidden',
    },
    Image: {
      width: size,
      height: size,
      resizeMode: 'contain' as ImageResizeMode,
    },
    SaveButton: {
      width: size,
    },
  });

  return (
    <Container center>
      <Text variant="headlineMedium">Halloween</Text>
      <ScrollView
        style={DrawStyles.ScrollView}
        ref={scrollViewRef}
        onContentSizeChange={() => {
          scrollViewRef.current &&
            scrollViewRef.current.scrollToEnd({
              animated: true,
            });
        }}>
        <View>
          {attempts.map((attempt: PromptedImage, index) => (
            <View className="items-center" key={attempt.value}>
              <SizedImage
                uri={attempt.uri}
                width="80%"
                title={`${index + 1} / ${attempts.length}`}
                text={attempt.prompt}
              />
              <Button
                style={DrawStyles.SaveButton}
                mode="contained-tonal"
                onPress={() => onSave(image)}>
                Select
              </Button>
              <View>{index !== attempts.length - 1 && <Divider />}</View>
            </View>
          ))}
        </View>
      </ScrollView>
      <ImagePrompt
        prompt={prompt}
        setPrompt={setPrompt}
        onDraw={onDraw}
        attempts={attempts}
      />
    </Container>
  );
};

const Vote = () => {
  const [images, setImages] = React.useState<PromptedImage[]>([]);
  const [selectedImage, setSelectedImage] = React.useState<PromptedImage>();
  const [lock, setLock] = React.useState(false);

  useOnMount(async () => {
    const newImages = [];

    for (let i = 0; i < 10; i++) {
      const image = await generateImageFromPrompt(`Image ${i}`, 'test prompt');
      newImages.push(image);
    }

    setImages(newImages);
  });

  const vote = (image: PromptedImage) => {
    console.log('Voting for', image);
    setSelectedImage(image);
    setLock(true);
  };

  const undo = () => {
    console.log('Undoing vote');
    setSelectedImage(undefined);
    setLock(false);
  };

  if (lock && selectedImage) {
    return (
      <Container center>
        <Text style={Styles.Text} variant="headlineMedium">
          Halloween
        </Text>
        <View style={Styles.ImageContainer}>
          <View style={Styles.RoundedImage}>
            <Image style={Styles.Image} source={{uri: selectedImage.uri}} />
          </View>
          <Button icon="undo" onPress={undo}>
            Undo
          </Button>
        </View>
      </Container>
    );
  }

  return (
    <>
      <Text style={Styles.Text} variant="headlineMedium">
        Halloween
      </Text>
      <ScrollView>
        <View style={Styles.Container}>
          {images.map((image: PromptedImage, index) => (
            <View key={image.value}>
              <View key={index} style={Styles.ImageContainer}>
                <View style={Styles.RoundedImage}>
                  <Image style={Styles.Image} source={{uri: image.uri}} />
                </View>
                <View className="flex-row items-center">
                  <Button icon="heart" onPress={() => vote(image)}>
                    Vote
                  </Button>
                </View>
              </View>
              {index !== images.length - 1 && <Divider />}
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
};

const RoundFinish = ({round}: {round?: Round}) => {
  console.log('round', round);
  const [image, setImage] = React.useState<PromptedImage>();

  useOnMount(async () => {
    const newImage = await generateImageFromPrompt('Best Image', 'test prompt');
    setImage(newImage);
  });

  const players = [
    {id: '1', name: 'Player 1'},
    {id: '2', name: 'Player 2'},
  ];

  return (
    <Container>
      <View className="flex-1 flex-grow flex-col w-full justify-between">
        <View className="w-full">
          <Surface>
            <View className="items-center w-full">
              <Text variant="headlineSmall">Halloween</Text>
            </View>
          </Surface>
        </View>
        <View>
          <Text variant="headlineMedium">Best Image</Text>
          <Surface>
            {image && (
              <View style={Styles.ImageContainer}>
                <View style={Styles.RoundedImage}>
                  <Image style={Styles.Image} source={{uri: image.uri}} />
                </View>
              </View>
            )}
          </Surface>
        </View>
        <View>
          <Text variant="headlineMedium">Scores</Text>
          <ScrollView className="w-full my-4">
            {players &&
              repeatArray(players, 1).map((player, i) => {
                return (
                  <View key={i} className="mb-4">
                    <Surface>
                      <View className="flex-row items-center">
                        <View className="grow">
                          <Text variant="titleMedium">{player.name}</Text>
                        </View>
                        <View className="flex-row items-center">
                          <Text variant="titleMedium">Score</Text>
                          <Text variant="titleMedium">0</Text>
                        </View>
                      </View>
                    </Surface>
                  </View>
                );
              })}
          </ScrollView>
        </View>
        <View className="w-full">
          <Button mode="contained">Next Round</Button>
        </View>
      </View>
    </Container>
  );
};

const Finish = ({game}: {game: SimonsGameType}) => {
  console.log('game', game);
  return (
    <Container center>
      <Surface>
        <Text>Halloween</Text>
      </Surface>
      <View>
        <Text style={Styles.Text} variant="headlineMedium">
          Scores
        </Text>
      </View>
      <View className="w-full">
        <Button mode="contained">End Game</Button>
      </View>
    </Container>
  );
};

const SimonsGame = ({
  game,
  debug,
}: {
  game?: SimonsGameType;
  debug?: boolean;
}) => {
  enum StagesEnum {
    CONTEXT = 'context',
    DRAW = 'draw',
    VOTE = 'vote',
    ROUND_FINISH = 'round_finish',
    FINISH = 'finish',
  }

  console.log(game);

  const [round, setRound] = React.useState<Round>();
  const [stage, setStage] = React.useState(StagesEnum.CONTEXT);

  return (
    <Container withoutPadding>
      {debug && (
        <View className="flex-row items-center">
          <ScrollView horizontal>
            {Object.keys(StagesEnum).map(stageSwitch => (
              <Button
                key={stageSwitch}
                onPress={() =>
                  setStage(stageSwitch.toLowerCase() as StagesEnum)
                }>
                {stageSwitch}
              </Button>
            ))}
          </ScrollView>
        </View>
      )}
      {stage === StagesEnum.CONTEXT ? (
        <ContextSelector />
      ) : stage === StagesEnum.DRAW ? (
        <Draw />
      ) : stage === StagesEnum.VOTE ? (
        <Vote />
      ) : stage === StagesEnum.ROUND_FINISH ? (
        <RoundFinish round={round} />
      ) : (
        <Finish game={game} />
      )}
    </Container>
  );
};

export default SimonsGame;
