import {PanResponder} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';

export const PanResponderTest = () => {
  return (
    <TestSuite name="PanResponder">
      <TestCase
        itShould="create PanResponder"
        fn={({expect}) => {
          expect(PanResponder.create({})).to.be.not.empty;
        }}
      />
    </TestSuite>
  );
};
