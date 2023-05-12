import {processColor} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';

export const MiscTest = () => {
  return (
    <TestSuite name="MiscTest">
      <TestCase
        itShould="represent a color as a number"
        fn={({expect}) => {
          expect(processColor('red')).to.be.eq(0xffff0000);
        }}
      />
    </TestSuite>
  );
};
