import {
  processColor,
  registerViewConfig,
  ReactNativeViewAttributes,
  dispatchCommand,
  Platform,
  DeviceEventEmitter,
  findNodeHandle,
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

      {Platform.OS === 'harmony' && (
        <TestCase
          itShould="export harmony specific utils: registerViewConfig, ReactNativeViewAttributes and dispatchCommand"
          fn={({expect}) => {
            expect(registerViewConfig).to.be.not.undefined;
            expect(ReactNativeViewAttributes).to.be.not.undefined;
            expect(dispatchCommand).to.be.not.undefined;
          }}
        />
      )}

      <TestCase
        itShould="export DeviceEventEmitter"
        fn={({expect}) => {
          expect(DeviceEventEmitter).to.be.not.undefined;
        }}
      />
      <TestCase
        itShould="export findNodeHandle"
        fn={({expect}) => {
          expect(findNodeHandle).to.be.not.undefined;
        }}
      />
    </TestSuite>
  );
};
