import {getLogger} from '../../utils';
import {firebaseGuid} from '../../utils/firebase';
import {PromptedImage} from './types';

const logger = getLogger('games.original.api');

type GenerationResponse = {
  type: 'url' | 'b64_json' | 'debug';
  url?: string;
  image?: string;
};

export const generateImageFromPrompt = (
  label: string,
  prompt: string,
  createdBy: string,
): PromptedImage => {
  const _log = logger.getChildLogger('generateImageFromPrompt');
  _log.debug('Generating image from prompt', prompt);

  const generationResponse: GenerationResponse = {
    type: 'debug',
  };

  const base = {
    id: firebaseGuid(),
    value: firebaseGuid(),
    icon: 'image',
    label: label,
    prompt: prompt,
    type: 'debug',
    createdBy: createdBy,
  };
  _log.debug('Generation response', generationResponse);

  switch (generationResponse?.type) {
    case 'url':
      return {
        ...base,
        uri: generationResponse.url ? generationResponse.url : '',
      };
    case 'b64_json':
      return {
        ...base,
        uri: `data:image/png;base64,${generationResponse.image}`,
      };
    default:
      const index = Math.floor(Math.random() * 100);
      _log.debug('Image type not supported. Using picsum at index', index);
      return {
        ...base,
        uri: `https://picsum.photos/id/${index}/256/256`,
      };
  }
};
