import {Linking} from 'react-native';
import {TestSuite, TestCase} from '@rnoh/testerino';
import {Button} from '../components';

export function LinkingTest() {
  return (
    <TestSuite name="Linking (Stub)">
      <TestCase
        itShould="not crash when checking if url can be opened"
        fn={async ({expect}) => {
          expect(await Linking.canOpenURL('http://foobar.com')).to.be.true;
        }}
      />
      <TestCase
        itShould="support http/https urls"
        fn={async ({expect}) => {
          expect(await Linking.canOpenURL('http://foobar.com')).to.be.true;
          expect(await Linking.canOpenURL('https://foobar.com')).to.be.true;
        }}
      />
      <TestCase
        itShould="support tel urls"
        fn={async ({expect}) => {
          expect(await Linking.canOpenURL('tel:1234567890')).to.be.true;
        }}
      />
      <TestCase
        itShould="not support wrong schema urls"
        fn={async ({expect}) => {
          expect(await Linking.canOpenURL('wrong://host')).to.be.false;
        }}
      />
      <TestCase itShould="open phone dialing on press">
        <Button
          onPress={() => Linking.openURL('tel:1234567890')}
          label="Call 1234567890"
        />
      </TestCase>
      <TestCase itShould="open sms app (sms app doesn't accept parameters)">
        <Button
          onPress={() => Linking.openURL('sms:1234567890')}
          label="Send SMS to 1234567890"
        />
      </TestCase>
      <TestCase itShould="open web page on press">
        <Button
          onPress={() =>
            Linking.openURL('https://reactnative.dev/docs/linking')
          }
          label="Open Linking Docs"
        />
      </TestCase>
      <TestCase itShould="open (http) web page on press">
        <Button
          onPress={() => Linking.openURL('http://info.cern.ch/')}
          label="Open an old webpage"
        />
      </TestCase>
      <TestCase itShould="open application settings">
        <Button onPress={() => Linking.openSettings()} label="Open settings" />
      </TestCase>
      <TestCase itShould="fail on bad url">
        <Button
          onPress={() =>
            Linking.openURL('bad://url').catch(e => console.warn(e))
          }
          label="Bad URL"
        />
      </TestCase>
    </TestSuite>
  );
}
