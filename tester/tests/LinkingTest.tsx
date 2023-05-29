import {Linking} from 'react-native';
import {TestSuite, TestCase} from '@rnoh/testerino';

export function LinkingTest() {
  return (
    <TestSuite name="Linking (Stub)">
      <TestCase
        itShould="not crash when checking if url can be opened"
        fn={async ({expect}) => {
          expect(await Linking.canOpenURL('http://foobar.com')).to.be.false;
        }}
      />
    </TestSuite>
  );
}
