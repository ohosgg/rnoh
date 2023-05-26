import {NativeEventEmitter} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';

export const NativeEventEmitterTest = () => {
  return (
    <TestSuite name="NativeEventEmitter">
      <TestCase
        itShould="emit and react to events"
        fn={async ({expect}) => {
          const eventEmitter = new NativeEventEmitter();
          return new Promise(resolve => {
            eventEmitter.addListener('foo', event => {
              expect(event).to.be.eq('payload');
              resolve();
            });
            eventEmitter.emit('foo', 'payload');
          });
        }}
      />
    </TestSuite>
  );
};
