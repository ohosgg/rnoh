import {StyleSheet, Text, View} from 'react-native';
import {TestSuite, TestCase} from '@rnoh/testerino';

const SAMPLE_PARAGRAPH_TEXT = `Quis exercitation do eu in laboris nulla sit elit officia. Incididunt ipsum aliquip commodo proident ad laborum aliquip fugiat sunt aute ea laboris mollit reprehenderit. Culpa non incididunt cupidatat esse laborum nulla quis mollit voluptate proident commodo. Consectetur ad deserunt do nulla sunt veniam magna laborum reprehenderit et ullamco fugiat fugiat.`;

export function TextTest() {
  return (
    <TestSuite name="Text">
      <TestCase
        skip // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/154
        itShould="show text with the dancing script font">
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
          <Text
            style={{
              height: '100%',
              backgroundColor: 'red',
              color: 'white',
              paddingLeft: 10,
              paddingRight: 30,
            }}>
            left
          </Text>
          <Text
            style={{height: '100%', backgroundColor: 'red', color: 'white'}}>
            right
          </Text>
        </View>
      </TestCase>
      <TestCase itShould="show text with deferent textDecorationLines">
        <View style={{width: 150, height: 80, backgroundColor: 'red'}}>
          <Text style={styles.text}>None</Text>
          <Text style={{...styles.text, textDecorationLine: 'underline'}}>
            underline
          </Text>
          <Text style={{...styles.text, textDecorationLine: 'line-through'}}>
            line-through
          </Text>
        </View>
      </TestCase>
      <TestSuite name="text measuring">
        <TestCase itShould="display: 'FOO''BAR' next to each other">
          <View
            style={{height: 32, alignSelf: 'flex-start', flexDirection: 'row'}}>
            <Text style={{height: '100%', backgroundColor: 'pink'}}>FOO</Text>
            <Text style={{height: '100%', backgroundColor: 'pink'}}>BAR</Text>
          </View>
        </TestCase>
        <TestCase
          skip //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/232
          itShould="render red rectangle after 'FOO'">
          <View
            style={{height: 32, alignSelf: 'flex-start', flexDirection: 'row'}}>
            <Text style={{height: '100%', backgroundColor: 'pink'}}>
              FOO
              <View style={{width: 32, height: 32, backgroundColor: 'red'}} />
              BAR
            </Text>
          </View>
        </TestCase>
        <TestCase itShould="show a long text without a space below or above">
          <Text>{SAMPLE_PARAGRAPH_TEXT}</Text>
        </TestCase>
        <TestCase itShould="show a long text without a space below or above (font size)">
          <Text style={{fontSize: 8}}>{SAMPLE_PARAGRAPH_TEXT}</Text>
        </TestCase>
        <TestCase itShould="show a long text without a space below or above (line height)">
          <Text style={{lineHeight: 21}}>{SAMPLE_PARAGRAPH_TEXT}</Text>
        </TestCase>
        <TestCase itShould="show 2 lines of text">
          <Text numberOfLines={2}>{SAMPLE_PARAGRAPH_TEXT}</Text>
        </TestCase>
        <TestCase
          skip // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/284
          itShould="show text without a space below or above (fragments)">
          <Text>
            <Text>
              Nostrud irure ex sunt dolor cillum irure laboris ex ut adipisicing
              magna reprehenderit Lorem.
            </Text>
            <Text style={{fontSize: 24}}>
              Do ullamco excepteur quis labore Lorem mollit tempor ex minim.
            </Text>
            <Text>
              Excepteur consequat officia ut incididunt consectetur qui
              reprehenderit quis quis ut cillum ad.
            </Text>
          </Text>
        </TestCase>
        <TestCase itShould="show INNER and OUTER texts on the same height (various lineHeights)">
          <View
            style={{
              flexDirection: 'row',
            }}>
            <Text style={{lineHeight: 20, backgroundColor: 'green'}}>
              <Text style={{lineHeight: 25, backgroundColor: 'yellow'}}>
                INNER
              </Text>
              OUTER
            </Text>
          </View>
        </TestCase>
      </TestSuite>
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
