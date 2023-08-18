import {PixelRatio} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';

export const PixelRatioTest = () => {
  return (
    <TestSuite name="PixelRatio">
      <TestCase
        itShould="return plausible pixel ratio (greater than 0)"
        fn={({expect}) => {
          expect(PixelRatio.get()).to.be.greaterThan(0);
        }}
      />
      <TestCase
        itShould="return plausible fontScale (greater than 0)"
        fn={({expect}) => {
          expect(PixelRatio.getFontScale()).to.be.greaterThan(0);
        }}
      />
    </TestSuite>
  );
};
