import {Platform} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';

export function PlatformConstantsTest() {
  return (
    <TestSuite name="PlatformConstants">
      <TestCase
        itShould="use 'harmony' as platform name"
        fn={({expect}) => {
          expect(Platform.OS).to.be.eq('harmony');
        }}
      />
      <TestCase
        itShould="specify platform version"
        fn={({expect}) => {
          expect(Platform.Version.toString().split('.').length - 1).to.be.eq(3);
        }}
      />
      <TestCase
        itShould="not be running in tv mode"
        fn={({expect}) => {
          expect(Platform.isTV).to.be.false;
        }}
      />
      <TestCase
        itShould="select Platform properly"
        fn={({expect}) => {
          expect(
            Platform.select({
              android: 'a',
              ios: 'i',
              native: 'n',
              harmony: 'h',
            }),
          ).to.be.eq('h');
        }}
      />
      <TestCase
        itShould="provide some RN version"
        fn={({expect}) => {
          expect(Platform.constants.reactNativeVersion).to.be.not.undefined;
          expect(Platform.constants.reactNativeVersion.major).to.be.not
            .undefined;
          expect(Platform.constants.reactNativeVersion.minor).to.be.not
            .undefined;
          expect(Platform.constants.reactNativeVersion.patch).to.be.not
            .undefined;
        }}
      />
      <TestCase
        itShould="provide some value for isTesting"
        fn={({expect}) => {
          expect(typeof Platform.constants.isTesting).to.be.eq('boolean');
        }}
      />
      <TestCase
        itShould="specify product model"
        fn={({expect}) => {
          if (Platform.OS === 'harmony') {
            expect(Platform.constants.Model).to.include('NOH');
          }
        }}
      />
    </TestSuite>
  );
}
