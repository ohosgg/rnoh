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
      <TestCase itShould="[FAIL] show text with the dancing script font">
        <View style={{height: 30, width: '100%'}}>
          <Text
            style={{
              ...styles.blackText,
              fontFamily: 'DancingScript-Regular',
              padding: 5,
            }}>
            Lorem ipsum dolor sit amet
          </Text>
        </View>
      </TestCase>
      <TestCase itShould="show text with different alignments">
        <View style={styles.container}>
          <Text style={styles.text}>Left</Text>
          <Text style={{...styles.text, textAlign: 'center'}}>Center</Text>
          <Text style={{...styles.text, textAlign: 'right'}}>Right</Text>
        </View>
      </TestCase>
      <TestCase itShould="format nested Text components">
        <View style={styles.container}>
          <Text style={[styles.text, {textAlign: 'right'}]}>
            <Text style={{fontWeight: 'bold'}}>Bold</Text>
            <Text style={{fontStyle: 'italic'}}>Italic</Text>
          </Text>
        </View>
      </TestCase>
      <TestCase itShould="test the the left and right padding of the text">
        <View style={{height: 32, flexDirection: 'row'}}>
          <Text style={{height: '100%', backgroundColor: 'red', color: 'white', paddingLeft: 10, paddingRight: 30}}>left</Text>
          <Text style={{height: '100%', backgroundColor: 'red', color: 'white'}}>right</Text>
        </View>
      </TestCase>
      <TestCase itShould="[FAIL] render red rectangle after 'FOO'">
        <View
          style={{height: 32, alignSelf: 'flex-start', flexDirection: 'row'}}>
          <Text style={{height: '100%', backgroundColor: 'pink'}}>
            FOO
            <View style={{width: 32, height: 32, backgroundColor: 'red'}} />
            BAR
          </Text>
        </View>
      </TestCase>
      <TestCase itShould="show text with deferent textDecorationLines">
        <View style={{width: 150, height: 80, backgroundColor: 'red'}}>
          <Text style={styles.text}>None</Text>
          <Text style={{...styles.text, textDecorationLine: 'underline'}}>underline</Text>
          <Text style={{...styles.text, textDecorationLine: 'line-through'}}>line-through</Text>
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
  blackText: {
    width: '100%',
    height: '100%',
    color: 'black',
  },
});
