import {PixelRatio} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';

export const PixelRatioTest = () => {
  return (
    <TestSuite name="PixelRatio">
      <TestCase
        itShould="return pixel ratio used in emulator"
        fn={({expect}) => {
          expect(PixelRatio.get()).to.be.eq(3);
        }}
      />
      <TestCase
        itShould="return the same value as pixel ratio"
        fn={({expect}) => {
          expect(PixelRatio.getFontScale()).to.be.eq(3);
        }}
      />
    </TestSuite>
  );
};
