import {Text, View} from 'react-native';
import {TestSuite, TestCase} from '@rnoh/testerino';

export function TextTest() {
  return (
    <TestSuite name="Text">
      <TestCase itShould="measure text width and display: 'FOO' 'BAR'">
        <View
          style={{height: 32, alignSelf: 'flex-start', flexDirection: 'row'}}>
          <Text style={{height: '100%', backgroundColor: 'pink', marginEnd: 8}}>
            FOO
          </Text>
          <Text style={{height: '100%', backgroundColor: 'pink'}}>BAR</Text>
        </View>
      </TestCase>
    </TestSuite>
  );
}
