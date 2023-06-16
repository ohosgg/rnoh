import {StyleSheet, Text, View} from 'react-native';
import {TestSuite, TestCase} from '@rnoh/testerino';

export function TextTest() {
  return (
    <TestSuite name="Text">
      <TestCase itShould="measure text width and display: 'FOO''BAR' next to each other">
        <View
          style={{height: 32, alignSelf: 'flex-start', flexDirection: 'row'}}>
          <Text style={{height: '100%', backgroundColor: 'pink'}}>FOO</Text>
          <Text style={{height: '100%', backgroundColor: 'pink'}}>BAR</Text>
        </View>
      </TestCase>
      <TestCase itShould="show text with different alignments">
        <View style={styles.container}>
          <Text style={styles.text}>Left</Text>
          <Text style={{...styles.text, textAlign: 'center'}}>Center</Text>
          <Text style={{...styles.text, textAlign: 'right'}}>Right</Text>
        </View>
      </TestCase>
    </TestSuite>
  );
}
const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    backgroundColor: 'red',
  },
  text: {
    width: '100%',
    height: '33%',
    color: 'white',
  },
});
