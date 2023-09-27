import { StyleSheet, Text, View } from 'react-native';
import { TestSuite, TestCase } from '@rnoh/testerino';
import { Button } from '../components';
import { useState } from 'react';

const SAMPLE_PARAGRAPH_TEXT = `Quis exercitation do eu in laboris nulla sit elit officia. Incididunt ipsum aliquip commodo proident ad laborum aliquip fugiat sunt aute ea laboris mollit reprehenderit. Culpa non incididunt cupidatat esse laborum nulla quis mollit voluptate proident commodo. Consectetur ad deserunt do nulla sunt veniam magna laborum reprehenderit et ullamco fugiat fugiat.`;

export function TextTest() {
  return (
    <TestSuite name="Text">
      <TestCase itShould="show selectable text">
        <View style={styles.smallContainer}>
          <Text style={styles.smallText} selectable={true}>
            Selectable text
          </Text>
        </View>
      </TestCase>
      <TestCase
        itShould="show 3 texts each with a different line break startegy"
        skip
      //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/274
      >
        <View style={styles.bigContainer}>
          <Text style={styles.smallTextWidth} lineBreakStrategyIOS="none">
            Lorem ipsum dolor sit amet
          </Text>
          <Text style={styles.smallTextWidth} lineBreakStrategyIOS="standard">
            Lorem ipsum dolor sit amet
          </Text>
          <Text style={styles.smallTextWidth} lineBreakStrategyIOS="push-out">
            Lorem ipsum dolor sit amet
          </Text>
        </View>
      </TestCase>
      <TestCase
        itShould="wrap two texts differently (hangul-word linebreak stategy)"
        skip
      //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/274
      >
        <View style={styles.container}>
          <Text style={styles.smallTextWidth} lineBreakStrategyIOS="none">
            ㄱㄱㄱㄱㄱㄱㄱㄱㄱㄱ ㄱㄱㄱㄱ
          </Text>
          <Text
            style={styles.smallTextWidth}
            lineBreakStrategyIOS="hangul-word">
            ㄱㄱㄱㄱㄱㄱㄱㄱㄱㄱ ㄱㄱㄱㄱ
          </Text>
        </View>
      </TestCase>
      <TestCase itShould="show two texts, both selectable, but one disabled ">
        <View
          style={{
            ...styles.smallContainer,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Text style={styles.smallText} disabled selectable>
            Disabled
          </Text>
          <Text style={styles.smallText} selectable>
            Enabled
          </Text>
        </View>
      </TestCase>
      <TestCase itShould="show text with different ellipsize mode">
        <View style={styles.hugeContainer}>
          <Text style={styles.smallText} ellipsizeMode="tail" numberOfLines={1}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Text>
          <Text style={styles.smallText} ellipsizeMode="clip" numberOfLines={1}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Text>
        </View>
      </TestCase>
      <TestCase
        itShould="fire onTextLayoutEvent after layout change"
        initialState={false}
        arrange={ctx => <OnTextLayoutView ctx={ctx} />}
        assert={({ expect, state }) => {
          expect(state).to.be.true;
        }}
        skip
      //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/277
      />
      <TestSuite name="TextStyle">
        <TestCase
          skip // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/154
          itShould="show text with the dancing script font">
          <View style={{ height: 30, width: '100%' }}>
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
        <TestCase itShould="show text with different horizontal alignments">
          <Text style={{textAlign: 'left'}}>Left:</Text>
          <Text style={{fontSize: 8}}>{SAMPLE_PARAGRAPH_TEXT}</Text>
          <Text style={{textAlign: 'center'}}>Center:</Text>
          <Text style={{fontSize: 8, textAlign: 'center'}}>
            {SAMPLE_PARAGRAPH_TEXT}
          </Text>
          <Text style={{textAlign: 'right'}}>Right:</Text>
          <Text style={{fontSize: 8, textAlign: 'right'}}>
            {SAMPLE_PARAGRAPH_TEXT}
          </Text>
          <Text style={{textAlign: 'justify'}}>Justify:</Text>
          <Text style={{fontSize: 8, textAlign: 'justify'}}>
            {SAMPLE_PARAGRAPH_TEXT}
          </Text>
        </TestCase>
        <TestCase itShould="show text with different vertical alignments (textAlignVertical)">
          <View style={styles.smallContainerRow}>
            <Text style={styles.blueShortText}>Auto</Text>
            <Text
              style={{
                ...styles.blueShortText,
                textAlignVertical: 'top',
              }}>
              Top
            </Text>
            <Text
              style={{
                ...styles.blueShortText,
                textAlignVertical: 'center',
              }}>
              Center
            </Text>
            <Text
              style={{
                ...styles.blueShortText,
                textAlignVertical: 'bottom',
              }}>
              Bottom
            </Text>
          </View>
        </TestCase>
        <TestCase itShould="show text with different vertical alignments (verticalAlign)">
          <View style={styles.smallContainerRow}>
            <Text style={styles.blueShortText}>Auto</Text>
            <Text style={{ ...styles.blueShortText, verticalAlign: 'top' }}>
              Top
            </Text>
            <Text
              style={{
                ...styles.blueShortText,
                verticalAlign: 'middle',
              }}>
              Middle
            </Text>
            <Text
              style={{
                ...styles.blueShortText,
                verticalAlign: 'bottom',
              }}>
              Bottom
            </Text>
          </View>
        </TestCase>
        <TestCase itShould="format nested Text components">
          <View style={styles.container}>
            <Text style={{ ...styles.text, textAlign: 'right' }}>
              <Text style={{ fontWeight: 'bold' }}>Bold</Text>
              <Text style={{ fontStyle: 'italic' }}>Italic</Text>
            </Text>
          </View>
        </TestCase>
        <TestCase itShould="test the the left and right padding of the text">
          <View style={{ height: 32, flexDirection: 'row' }}>
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
              style={{ height: '100%', backgroundColor: 'red', color: 'white' }}>
              right
            </Text>
          </View>
        </TestCase>
        <TestCase itShould="show text with different textDecorationLines">
          <View style={styles.container}>
            <Text style={styles.text}>None</Text>
            <Text style={{ ...styles.text, textDecorationLine: 'underline' }}>
              underline
            </Text>
            <Text style={{ ...styles.text, textDecorationLine: 'line-through' }}>
              line-through
            </Text>
          </View>
        </TestCase>
        <TestCase
          itShould="show lined-through text with text decoration color"
          skip
        //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/271
        >
          <View style={styles.smallContainer}>
            <Text
              style={{
                ...styles.smallText,
                textDecorationLine: 'line-through',
                textDecorationColor: 'blue',
              }}>
              line-trough blue
            </Text>
          </View>
        </TestCase>
        <TestCase itShould="show text with big letter spacing">
          <View style={styles.smallContainer}>
            <Text style={{ ...styles.smallText, letterSpacing: 8 }}>
              Spacing: 8
            </Text>
          </View>
        </TestCase>
        <TestCase
          itShould="show text with shadow"
          skip
        //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/278
        >
          <View>
            <Text
              style={{
                height: 40,
                fontSize: 20,
                fontWeight: '900',
                textShadowColor: 'rgba(0,0,255,0.8)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 20,
              }}>
              Text with shadow
            </Text>
          </View>
        </TestCase>
        <TestCase
          itShould="show text with text transformed"
          skip
        //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/279
        //  123 1one is added to the end of text to see if the code correctly handles number
        >
          <View style={styles.bigContainer}>
            <Text style={styles.smallText}>Text transform none 123 1one</Text>
            <Text
              style={{
                ...styles.smallText,
                textTransform: 'capitalize',
              }}>
              Text transform capitalize 123 1one
            </Text>
            <Text
              style={{
                ...styles.smallText,
                textTransform: 'uppercase',
              }}>
              Text transform uppercase 123 1one
            </Text>
            <Text
              style={{
                ...styles.smallText,
                textTransform: 'lowercase',
              }}>
              Text transform lowercase 123 1one
            </Text>
          </View>
        </TestCase>
        <TestCase
          itShould="show text with different writing direction"
          skip
        //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/280
        >
          <View style={styles.container}>
            <Text style={styles.smallText}>Writing direction auto</Text>
            <Text
              style={{
                ...styles.smallText,
                writingDirection: 'ltr',
              }}>
              Writing direction ltr
            </Text>
            <Text
              style={{
                ...styles.smallText,
                writingDirection: 'rtl',
              }}>
              Writing direction rtl
            </Text>
          </View>
        </TestCase>
        <TestCase
          itShould="show text aligned vertically with/without font padding included"
          skip
        //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/281
        >
          <View style={styles.smallContainerRow}>
            <Text
              style={{
                ...styles.smallText,
                textAlignVertical: 'center',
                includeFontPadding: false,
              }}>
              TEXT
            </Text>
            <Text
              style={{
                ...styles.smallText,
                textAlignVertical: 'center',
              }}>
              TEXT
            </Text>
          </View>
        </TestCase>
      </TestSuite>
      <TestSuite name="text measuring">
        <TestCase itShould="display: 'FOO''BAR' next to each other">
          <View
            style={{ height: 32, alignSelf: 'flex-start', flexDirection: 'row' }}>
            <Text style={{ height: '100%', backgroundColor: 'pink' }}>FOO</Text>
            <Text style={{ height: '100%', backgroundColor: 'pink' }}>BAR</Text>
          </View>
        </TestCase>
        <TestCase itShould="display: 'FOO''BAR' next to each other with different letterSpacing">
          <View
            style={{ height: 32, alignSelf: 'flex-start', flexDirection: 'row' }}>
            <Text
              style={{
                height: '100%',
                backgroundColor: 'pink',
                letterSpacing: 8,
              }}>
              FOO
            </Text>
            <Text
              style={{
                height: '100%',
                backgroundColor: 'pink',
                letterSpacing: 4,
              }}>
              BAR
            </Text>
          </View>
        </TestCase>
        <TestCase
          skip //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/232
          itShould="render red rectangle after 'FOO'">
          <View
            style={{ height: 32, alignSelf: 'flex-start', flexDirection: 'row' }}>
            <Text style={{ height: '100%', backgroundColor: 'pink' }}>
              FOO
              <View style={{ width: 32, height: 32, backgroundColor: 'red' }} />
              BAR
            </Text>
          </View>
        </TestCase>
        <TestCase itShould="show a long text without a space below or above">
          <Text>{SAMPLE_PARAGRAPH_TEXT}</Text>
        </TestCase>
        <TestCase itShould="show a long text without a space below or above (font size)">
          <Text style={{ fontSize: 8 }}>{SAMPLE_PARAGRAPH_TEXT}</Text>
        </TestCase>
        <TestCase itShould="show a long text without a space below or above (line height)">
          <Text style={{ lineHeight: 21 }}>{SAMPLE_PARAGRAPH_TEXT}</Text>
        </TestCase>
        <TestCase itShould="show 2 lines of text">
          <Text numberOfLines={2}>{SAMPLE_PARAGRAPH_TEXT}</Text>
        </TestCase>
        <TestCase itShould="show text without a space below or above (fragments)">
          <Text>
            <Text>
              Nostrud irure ex sunt dolor [\n]{'\n'}cillum irure laboris ex ut
              adipisicing magna reprehenderit Lorem.
            </Text>
            <Text style={{ fontSize: 24 }}>
              Do ullamco excepteur quis labore Lorem mollit tempor ex minim.
            </Text>
            <Text>
              Excepteur consequat officia ut incididunt consectetur qui
              reprehenderit quis quis ut cillum ad.
            </Text>
          </Text>
        </TestCase>
      </TestSuite>
      <TestSuite name="nested texts">
        <TestCase itShould="show INNER and OUTER texts on the same height (various lineHeights)">
          <View
            style={{
              flexDirection: 'row',
            }}>
            <Text style={{ lineHeight: 20, backgroundColor: 'green' }}>
              <Text style={{ lineHeight: 25, backgroundColor: 'yellow' }}>
                INNER
              </Text>
              OUTER
            </Text>
          </View>
        </TestCase>
        <TestCase
          skip // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/230
          itShould="use green background color for INNER (backgroundColor in text fragments)">
          <View
            style={{
              flexDirection: 'row',
            }}>
            <Text style={{ backgroundColor: 'red' }}>
              <Text style={{ backgroundColor: 'green' }}>INNER</Text>
              OUTER
            </Text>
          </View>
        </TestCase>
        <TestCase
          skip
          itShould="show text with different vertical alignments (verticalAlign)">
          <View style={{...styles.smallContainerRow}}>
            <Text style={{verticalAlign: 'auto'}}>
              -<Text style={styles.blueShortText}>Auto</Text>-
            </Text>
            <Text style={{verticalAlign: 'top'}}>
              -<Text style={styles.blueShortText}>Top</Text>-
            </Text>
            <Text style={{verticalAlign: 'middle'}}>
              -<Text style={styles.blueShortText}>Middle</Text>-
            </Text>
            <Text style={{verticalAlign: 'bottom'}}>
              -<Text style={styles.blueShortText}>Bottom</Text>-
            </Text>
          </View>
        </TestCase>
        <TestCase
          skip
          itShould="show text with different vertical alignments (textAlignVertical)">
          <View style={{...styles.smallContainerRow}}>
            <Text style={{textAlignVertical: 'auto'}}>
              -<Text style={styles.blueShortText}>Auto</Text>-
            </Text>
            <Text style={{textAlignVertical: 'top'}}>
              -<Text style={styles.blueShortText}>Top</Text>-
            </Text>
            <Text style={{textAlignVertical: 'center'}}>
              -<Text style={styles.blueShortText}>Center</Text>-
            </Text>
            <Text style={{textAlignVertical: 'bottom'}}>
              -<Text style={styles.blueShortText}>Bottom</Text>-
            </Text>
          </View>
        </TestCase>
        <TestCase
          skip
          itShould="show text with different horizontal alignments">
          <Text style={{textAlign: 'left'}}>
            <Text>Left: </Text>
            <Text style={{fontSize: 8}}>{SAMPLE_PARAGRAPH_TEXT}</Text>
          </Text>
          <Text style={{textAlign: 'center'}}>
            <Text>Center: </Text>
            <Text style={{fontSize: 8}}>{SAMPLE_PARAGRAPH_TEXT}</Text>
          </Text>
          <Text style={{textAlign: 'right'}}>
            <Text>Right: </Text>
            <Text style={{fontSize: 8}}>{SAMPLE_PARAGRAPH_TEXT}</Text>
          </Text>
          <Text style={{textAlign: 'justify'}}>
            <Text>Justify: </Text>
            <Text style={{fontSize: 8}}>{SAMPLE_PARAGRAPH_TEXT}</Text>
          </Text>
        </TestCase>
      </TestSuite>
    </TestSuite>
  );
}

const OnTextLayoutView = (props: {
  ctx: {
    state: boolean;
    setState: React.Dispatch<React.SetStateAction<boolean>>;
    reset: () => void;
  };
}) => {
  const [width, setWidth] = useState(100);

  return (
    <View style={styles.container}>
      <Text
        style={{
          ...styles.smallText,
          width: width,
          backgroundColor: 'blue',
        }}
        onTextLayout={() => props.ctx.setState(true)}>
        Lorem ipsum dolor sit amet
      </Text>
      <Button
        label="Restart"
        onPress={() => {
          setWidth(width === 100 ? 200 : 100);
          props.ctx.reset();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 80,
    backgroundColor: 'red',
  },
  smallContainer: {
    width: 200,
    height: 40,
    backgroundColor: 'red',
  },
  smallContainerRow: {
    width: 200,
    height: 40,
    backgroundColor: 'red',
    flexDirection: 'row',
  },
  bigContainer: {
    width: 200,
    height: 120,
    backgroundColor: 'red',
  },
  hugeContainer: {
    width: 200,
    height: 160,
    backgroundColor: 'red',
  },
  text: {
    width: '100%',
    color: 'white',
  },
  smallText: {
    height: 30,
    color: 'white',
  },
  smallTextWidth: {
    height: 30,
    color: 'white',
    width: 150,
  },
  blueShortText: {
    height: 30,
    width: 50,
    color: 'white',
    backgroundColor: 'blue',
  },
  blackText: {
    width: '100%',
    height: '100%',
    color: 'black',
  },
});
