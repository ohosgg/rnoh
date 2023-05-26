import {TestSuite, TestCase} from '@rnoh/testerino';
import {I18nManager} from 'react-native';

export function I18nManagerTest() {
  return (
    <TestSuite name="I18nManager">
      <TestCase
        itShould="be LTR be true"
        fn={({expect}) => {
          expect(I18nManager.isRTL).to.be.false;
        }}
      />
      <TestCase
        itShould="doLeftAndRightSwapInRTL to be true"
        fn={({expect}) => {
          expect(I18nManager.doLeftAndRightSwapInRTL).to.be.true;
        }}
      />
    </TestSuite>
  );
}
