import {InteractionManager} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';

export function InteractionManagerTest() {
  return (
    <TestSuite name="InteractionManager">
      <TestCase
        itShould="execute callback to be executed without crashing"
        fn={async () => {
          return new Promise(resolve => {
            InteractionManager.runAfterInteractions(resolve);
          });
        }}
      />
    </TestSuite>
  );
}
