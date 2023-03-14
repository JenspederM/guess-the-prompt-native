import React, {useState} from 'react';
import {Button} from 'react-native-paper';

import LabelledTextInput from '../../../components/LabelledTextInput';
import SafeView from '../../../components/SafeView';

const Theme = ({
  onContinue,
}: {
  onContinue: (theme: string) => Promise<void>;
}) => {
  const [value, setValue] = useState('');

  return (
    <SafeView centerItems centerContent rowGap={32}>
      <LabelledTextInput
        title="Set a Theme"
        label="Enter your theme here"
        placeholder='e.g. "Halloween"'
        value={value}
        onChangeValue={setValue}
      />
      <Button mode="contained" onPress={() => onContinue(value)}>
        Continue
      </Button>
    </SafeView>
  );
};

export default Theme;
