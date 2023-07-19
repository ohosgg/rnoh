import {
  processColor,
  registerViewConfig,
  ReactNativeViewAttributes,
} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';

export const MiscTest = () => {
  return (
    <TestSuite name="Misc">
      <TestCase
        itShould="represent a color as a number"
        fn={({expect}) => {
          expect(processColor('red')).to.be.eq(0xffff0000);
        }}
      />
      <TestCase
        itShould="export harmony specific utils: registerViewConfig and ReactNativeViewAttributes"
        fn={({expect}) => {
          expect(registerViewConfig).to.be.not.undefined;
          expect(ReactNativeViewAttributes).to.be.not.undefined;
        }}
      />
    </TestSuite>
  );
};
