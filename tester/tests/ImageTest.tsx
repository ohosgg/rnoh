import {Image} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';

export const ImageTest = () => {
  return (
    <TestSuite name="Image">
      <TestCase itShould="support loading local images">
        <Image source={require('../assets/pravatar-131.jpg')} />
      </TestCase>
    </TestSuite>
  );
};
