import {getLogger} from '../../utils';
import {firebaseGuid} from '../../utils/firebase';
import {PromptedImage} from './types';

const logger = getLogger('games.original.api');

export const generateImageFromPrompt = async (
  label: string,
  prompt: string,
): Promise<PromptedImage> => {
  const _log = logger.getChildLogger('generateImageFromPrompt');
  _log.debug('Generating image from prompt', prompt);

  const generationResponse = {
    type: 'debug',
    uri: '',
  };

  const guid = firebaseGuid();

  switch (generationResponse.type) {
    case 'url':
      return {
        icon: 'image',
        label: label,
        value: guid,
        type: 'url',
        prompt: prompt,
        uri: generationResponse.uri,
      };
    case 'b64_json':
      return {
        icon: 'image',
        label: label,
        value: guid,
        type: 'b64_json',
        prompt: prompt,
        uri: `data:image/png;base64,${generationResponse.uri}`,
      };
    default:
      const index = Math.floor(Math.random() * 100);
      _log.debug('Image type not supported. Using picsum at index', index);
      return {
        icon: 'image',
        label: label,
        value: guid,
        type: 'url',
        prompt: prompt,
        uri: `https://picsum.photos/id/${index}/256/256`,
      };
  }
};
