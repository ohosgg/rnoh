import {StyleSheet, Text, View} from 'react-native';
import {TestSuite, TestCase} from '@rnoh/testerino';
import {Button, PressCounter} from '../components';
import {useState} from 'react';

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
      <TestCase itShould="render text in one line">
        <View style={{flexDirection: 'row'}}>
          <Text style={{fontSize: 10}}>/ {'100'}</Text>
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
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
        skip
        //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/277
      />
      <TestCase
        itShould="fire onLayout event after layout change"
        initialState={{}}
        arrange={ctx => <OnLayoutView ctx={ctx} />}
        assert={({expect, state}) => {
          expect(state).to.have.all.keys('x', 'y', 'width', 'height');
        }}
      />
      <TestSuite name="TextStyle">
        <TestCase itShould="show text with the Pacifico Regular font">
          <View style={{height: 30, width: '100%'}}>
            <Text
              style={{
                ...styles.blackText,
                fontFamily: 'Pacifico-Regular',
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
            <Text style={{...styles.blueShortText, verticalAlign: 'top'}}>
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
            <Text style={{...styles.text, textAlign: 'right'}}>
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
        <TestCase itShould="show text with different textDecorationLines">
          <View style={styles.container}>
            <Text style={styles.text}>None</Text>
            <Text style={{...styles.text, textDecorationLine: 'underline'}}>
              underline
            </Text>
            <Text style={{...styles.text, textDecorationLine: 'line-through'}}>
              line-through
            </Text>
          </View>
        </TestCase>
        <TestCase
          itShould="show lined-through text with text decoration color or font color"
          skip
          //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/271
        >
          <View style={styles.container}>
            <Text
              style={{
                ...styles.smallText,
                textDecorationLine: 'line-through',
                textDecorationColor: 'blue',
              }}>
              line-through blue
            </Text>
            <Text
              style={{
                ...styles.smallText,
                textDecorationLine: 'line-through',
              }}>
              line-through white
            </Text>
          </View>
        </TestCase>
        <TestCase itShould="show text with big letter spacing">
          <View style={styles.smallContainer}>
            <Text style={{...styles.smallText, letterSpacing: 8}}>
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
                textShadowOffset: {width: 1, height: 1},
                textShadowRadius: 20,
              }}>
              Text with shadow
            </Text>
          </View>
        </TestCase>
        <TestCase
          itShould="show text with correct textTransform"
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
        <TestCase tags={['dev']} itShould="not wrap any text">
          <View
            style={{
              backgroundColor: 'yellow',
              width: '100%',
              height: 40,
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}>
            {[
              {
                sortCode: '0',
                sortName: '综合',
              },
              {
                sortCode: '2',
                sortName: '最新',
              },
              {
                sortCode: '3',
                sortName: '评论',
              },
              {
                sortCode: '1',
                sortName: '价格',
              },
            ].map((item, index) => (
              <View
                style={{width: '20%', flexDirection: 'column'}}
                key={item.sortCode + '_' + index}>
                <View
                  style={{
                    width: '100%',
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}>
                  <Text
                    ellipsizeMode={'tail'}
                    numberOfLines={1}
                    style={{fontSize: 14, lineHeight: 19}}>
                    {item.sortName}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </TestCase>
        <TestCase itShould="display all texts in one line">
          <View style={{alignSelf: 'flex-start', flexDirection: 'row'}}>
            <Text style={{backgroundColor: 'cyan'}}>
              {'0:12'}
              {'场'}
            </Text>
          </View>
          <View style={{alignSelf: 'flex-start', flexDirection: 'row'}}>
            <Text style={{backgroundColor: 'pink'}}>
              {'0;12'}
              {'场'}
            </Text>
          </View>
          <View style={{alignSelf: 'flex-start', flexDirection: 'row'}}>
            <Text style={{backgroundColor: 'cyan'}}>
              {'0.12'}
              {'场'}
            </Text>
          </View>
          <View style={{alignSelf: 'flex-start', flexDirection: 'row'}}>
            <Text style={{backgroundColor: 'pink'}}>
              {'0,12'}
              {'场'}
            </Text>
          </View>
        </TestCase>
        <TestCase itShould="display: 'FOO''BAR' next to each other">
          <View style={{alignSelf: 'flex-start', flexDirection: 'row'}}>
            <Text style={{height: '100%', backgroundColor: 'pink'}}>FOO</Text>
            <Text style={{height: '100%', backgroundColor: 'cyan'}}>BAR</Text>
          </View>
        </TestCase>
        <TestCase itShould="display: 'FOO''BAR' in two lines">
          <View
            style={{
              width: 32,
              flexDirection: 'row',
              borderWidth: 1,
            }}>
            <Text style={{height: '100%', backgroundColor: 'pink'}}>
              FOO BAR
            </Text>
          </View>
        </TestCase>
        <TestCase itShould="display: 'FOO''BAR' next to each other with different fonts">
          <View
            style={{height: 32, alignSelf: 'flex-start', flexDirection: 'row'}}>
            <Text
              style={{
                height: '100%',
                backgroundColor: 'pink',
                fontFamily: 'StintUltraCondensed-Regular',
              }}>
              FOO
            </Text>
            <Text
              style={{
                height: '100%',
                backgroundColor: 'pink',
                fontFamily: 'Pacifico-Regular',
              }}>
              BAR
            </Text>
          </View>
        </TestCase>
        <TestCase itShould="display: 'FOO''BAR' next to each other with different letterSpacing">
          <View style={{alignSelf: 'flex-start', flexDirection: 'row'}}>
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
                backgroundColor: 'cyan',
                letterSpacing: 4,
              }}>
              BAR
            </Text>
          </View>
        </TestCase>
        <TestCase itShould="text should not exceed cyan background (measuring text on cpp side)">
          <View style={{alignSelf: 'flex-start', flexDirection: 'row'}}>
            <Text style={{backgroundColor: 'silver'}}>FONT SIZE</Text>
          </View>
          <View style={{alignSelf: 'flex-start', flexDirection: 'row'}}>
            <Text style={{fontSize: 20, backgroundColor: 'cyan'}}>
              FONT SIZE
            </Text>
          </View>
          <View style={{alignSelf: 'flex-start', flexDirection: 'row'}}>
            <Text style={{backgroundColor: 'silver'}}>FONT WEIGHT</Text>
          </View>
          <View style={{alignSelf: 'flex-start', flexDirection: 'row'}}>
            <Text style={{fontWeight: 'bold', backgroundColor: 'cyan'}}>
              FONT WEIGHT
            </Text>
          </View>
          <View style={{alignSelf: 'flex-start', flexDirection: 'row'}}>
            <Text style={{backgroundColor: 'silver'}}>LETTER SPACING!</Text>
          </View>
          {/* On Android letter spacing may cause the bounding box to be full width (remove ! to see the problem) */}
          <View style={{alignSelf: 'flex-start', flexDirection: 'row'}}>
            <Text style={{letterSpacing: 1, backgroundColor: 'cyan'}}>
              LETTER SPACING!
            </Text>
          </View>
          <View style={{alignSelf: 'flex-start', flexDirection: 'row'}}>
            <Text style={{backgroundColor: 'silver'}}>
              NUMBER OF LINES @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @
              @ @ @
            </Text>
          </View>
          <View style={{alignSelf: 'flex-start', flexDirection: 'row'}}>
            <Text
              style={{width: 256, backgroundColor: 'cyan'}}
              numberOfLines={1}>
              NUMBER OF LINES @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @
              @ @ @
            </Text>
          </View>
          <View style={{alignSelf: 'flex-start', flexDirection: 'row'}}>
            <Text style={{backgroundColor: 'silver'}}>LINE HEIGHT</Text>
          </View>
          <View style={{alignSelf: 'flex-start', flexDirection: 'row'}}>
            <Text
              style={{lineHeight: 32, backgroundColor: 'cyan'}}
              numberOfLines={1}>
              LINE HEIGHT
            </Text>
          </View>
        </TestCase>
        <TestSuite name="views in text">
          <TestCase itShould="vertically align text and view">
            <Text style={{color: 'red', lineHeight: 82}}>
              {'Hello World'}
              <View
                style={{width: 12, height: 12, backgroundColor: 'blue'}}></View>
            </Text>
          </TestCase>
          <TestCase itShould="not crash when a view is trimmed by number of lines (#1)">
            <Text numberOfLines={1}>
              '中文测试中文测试中文测试中文测试中文测试中文测试中文测试中文测试'
              {<View style={{width: 64, height: 64, backgroundColor: 'red'}} />}
            </Text>
          </TestCase>
          <TestCase itShould="not crash when a view is trimmed by number of lines (#2)">
            <Text numberOfLines={1}>
              {'中文测试中文测试'}
              {<View style={{width: 308, height: 5, backgroundColor: 'red'}} />}
            </Text>
          </TestCase>
          <TestCase itShould="wrap first and second paragraph in the same way">
            <View style={{width: 200, backgroundColor: 'silver'}}>
              <Text>
                天地玄黄 宇宙洪荒 日月盈昃 辰宿列张 寒来暑往 秋收冬藏 闰馀成岁
              </Text>
              <Text style={{marginTop: 16}}>
                <Text style={{fontWeight: 'bold'}}>天地玄黄</Text> 宇宙洪荒
                日月盈昃 辰宿列张 寒来暑往 秋收冬藏 闰馀成岁
              </Text>
            </View>
          </TestCase>
          <TestCase itShould="not crash the app">
            <Text>
              <View style={{width: 64, height: 64, backgroundColor: 'red'}} />
            </Text>
          </TestCase>
          <TestCase itShould="render red rectangle after 'FOO'">
            <View
              style={{
                height: 32,
                alignSelf: 'flex-start',
                flexDirection: 'row',
              }}>
              <Text style={{height: '100%', backgroundColor: 'pink'}}>
                FOO
                <View style={{width: 32, height: 16, backgroundColor: 'red'}} />
                BAR
              </Text>
            </View>
          </TestCase>
          <TestCase itShould="render view in first line and text in second">
            <View
              style={{
                width: 256,
                borderWidth: 1,
              }}>
              <Text numberOfLines={2}>
                <View
                  style={{
                    width: 200,
                    height: 30,
                    backgroundColor: 'red',
                  }}
                />
                test12345678901234567890
              </Text>
            </View>
          </TestCase>
          <TestCase itShould="[fails on Android/Harmony] render red rectangle after 'FOO' (flex)">
            <View
              style={{
                height: 32,
                alignSelf: 'flex-start',
                flexDirection: 'row',
              }}>
              <Text
                style={{
                  height: '100%',
                  backgroundColor: 'pink',
                  flexDirection: 'row',
                }}>
                FOO
                <View style={{flex: 1, height: 32, backgroundColor: 'red'}} />
                BAR
              </Text>
            </View>
          </TestCase>
          <TestCase itShould="[buggy on Android/Harmony] render red rectangle after 'FOO' (width: 50%, height: 50%)">
            <View
              style={{
                height: 32,
                alignSelf: 'flex-start',
                flexDirection: 'row',
              }}>
              <Text style={{height: '100%', backgroundColor: 'pink'}}>
                FOO
                <View
                  style={{width: '50%', height: '50%', backgroundColor: 'red'}}
                />
                BAR
              </Text>
            </View>
          </TestCase>
          <TestCase itShould="render red rectangle with 'BAZ' inside after 'FOO'">
            <View
              style={{
                height: 32,
                alignSelf: 'flex-start',
                flexDirection: 'row',
              }}>
              <Text style={{height: '100%', backgroundColor: 'pink'}}>
                FOO
                <View style={{backgroundColor: 'red'}}>
                  <Text>BAZ</Text>
                </View>
                BAR
              </Text>
            </View>
          </TestCase>
        </TestSuite>
        <TestCase itShould="show a long text without a space below or above">
          <Text>{SAMPLE_PARAGRAPH_TEXT}</Text>
        </TestCase>
        <TestCase itShould="show a long text without a space below or above (fontFamily)">
          <Text style={{fontFamily: 'StintUltraCondensed-Regular'}}>
            {SAMPLE_PARAGRAPH_TEXT}
          </Text>
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
        <TestCase itShould="show text without a space below or above (fragments)">
          <Text>
            <Text>
              Nostrud irure ex sunt dolor [\n]{'\n'}cillum irure laboris ex ut
              adipisicing magna reprehenderit Lorem.
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
        <TestCase
          itShould="show text without a space below or above (fragments with different fonts)"
          skip
          //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/564
          //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/565
        >
          <Text>
            <Text style={{fontFamily: 'StintUltraCondensed-Regular'}}>
              Nostrud irure ex sunt dolor [\n]{'\n'}cillum irure laboris ex ut
              adipisicing magna reprehenderit Lorem.
            </Text>
            <Text style={{fontSize: 24, fontFamily: 'Pacifico-Regular'}}>
              Do ullamco excepteur quis labore Lorem mollit tempor ex minim.
            </Text>
            <Text>
              Excepteur consequat officia ut incididunt consectetur qui
              reprehenderit quis quis ut cillum ad.
            </Text>
          </Text>
        </TestCase>
      </TestSuite>
      <TestSuite name="padding">
        <TestCase itShould="preserve a gap of atleast 24 pixels from each container edge">
          <View style={{width: 300}}>
            <Text style={{padding: 24, borderWidth: 1}}>
              <Text style={{color: 'blue'}}>Fragment1</Text>
              {
                'Fragment2 Fragment2 Fragment2 Fragment2 Fragment2 Fragment2 Fragment2 '
              }
            </Text>
            <Text style={{padding: 24, borderWidth: 1}}>
              Fragment1 Fragment1 Fragment1 Fragment1 Fragment1 Fragment1
              Fragment1 Fragment1
            </Text>
          </View>
        </TestCase>
        <TestCase
          skip
          itShould="[FAILS on Harmony and Android] display the attachment inline with text">
          <Text style={{padding: 20}}>
            Fragment1
            <PressCounter />
          </Text>
        </TestCase>
      </TestSuite>
      <TestSuite name="nested texts">
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
        <TestCase itShould="show text with ellipsize at the end of the firs line">
          <Text ellipsizeMode="tail" numberOfLines={1}>
            Cupidatat irure velit id consequat magna irure quis laborum aute
            anim est cillum aliqua dolor.
          </Text>
        </TestCase>
        <TestCase itShould="use green background color for INNER (backgroundColor in text fragments)">
          <View
            style={{
              flexDirection: 'row',
            }}>
            <Text style={{backgroundColor: 'red'}}>
              <Text style={{backgroundColor: 'green'}}>INNER</Text>
              OUTER
            </Text>
          </View>
        </TestCase>
        <TestCase itShould="show text with different vertical alignments (verticalAlign)">
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
        <TestCase itShould="show text with different fontStyles">
          <View style={{...styles.smallContainerRow}}>
            <Text style={{fontStyle: 'normal'}}>
              <Text style={styles.blueShortText}>Normal</Text>
            </Text>
            <Text style={{fontStyle: 'italic'}}>
              <Text style={styles.blueShortText}>Top</Text>
            </Text>
          </View>
        </TestCase>
        <TestCase itShould="show text with different text decorations">
          <View style={{...styles.smallContainerRow}}>
            <Text
              style={{
                textDecorationLine: 'line-through',
                textDecorationColor: 'green',
              }}>
              <Text style={styles.blueShortText}>Green line-through</Text>
            </Text>
            <Text
              style={{
                textDecorationLine: 'underline',
                textDecorationColor: 'blue',
              }}>
              <Text style={styles.blueShortText}>Blue underline</Text>
            </Text>
          </View>
        </TestCase>
        <TestCase
          itShould="show text with shadow"
          skip
          //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/278
        >
          <View style={styles.smallContainer}>
            <Text
              style={{
                textShadowColor: 'rgba(0,0,255,0.8)',
                textShadowOffset: {width: 1, height: 1},
                textShadowRadius: 20,
              }}>
              <Text style={styles.smallText}>Text with shadow</Text>
            </Text>
          </View>
        </TestCase>
        <TestCase
          itShould="show text with correct textTransform "
          //  123 1one is added to the end of text to see if the code correctly handles number
        >
          <View style={styles.bigContainer}>
            <Text style={styles.smallText}>Text transform none 123 1one</Text>
            <Text
              style={{
                textTransform: 'capitalize',
              }}>
              <Text style={styles.blueShortText}>
                Text transform capitalize 123 1one
              </Text>
            </Text>
            <Text
              style={{
                textTransform: 'uppercase',
              }}>
              <Text style={styles.blueShortText}>
                Text transform uppercase 123 1one
              </Text>
            </Text>
            <Text
              style={{
                textTransform: 'lowercase',
              }}>
              <Text style={styles.blueShortText}>
                Text transform lowercase 123 1one
              </Text>
            </Text>
          </View>
        </TestCase>
        <TestCase itShould="show text with different vertical alignments (textAlignVertical)">
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
        <TestCase itShould="align text vertically">
          <View style={{width: 300, borderRightWidth: 1}}>
            <Text>
              <Text style={{lineHeight: 64, backgroundColor: 'red'}}>
                lineHeight: 64
              </Text>
              <Text style={{lineHeight: 16, backgroundColor: 'blue'}}>
                lineHeight: 16; lineHeight: 16; lineHeight: 16; lineHeight: 16;
              </Text>
              <View
                style={{backgroundColor: 'purple', width: 16, height: 16}}
              />
            </Text>
            <Text style={{marginTop: 16}}>
              <Text style={{lineHeight: 16, backgroundColor: 'blue'}}>
                lineHeight: 16
              </Text>
              <Text style={{lineHeight: 64, backgroundColor: 'red'}}>
                lineHeight: 64; lineHeight: 64; lineHeight: 64; lineHeight: 64
              </Text>
              <View
                style={{backgroundColor: 'purple', width: 16, height: 16}}
              />
            </Text>

            <Text style={{marginTop: 16}}>
              <Text
                style={{
                  lineHeight: 64,
                  backgroundColor: 'red',
                  verticalAlign: 'bottom',
                }}>
                lineHeight: 16; verticalAlign: bottom; lineHeight: 16;
                verticalAlign: bottom;
              </Text>
              <Text
                style={{
                  lineHeight: 16,
                  backgroundColor: 'blue',
                  verticalAlign: 'bottom',
                }}>
                lineHeight: 16; verticalAlign: bottom;
              </Text>
            </Text>
          </View>
        </TestCase>
        <TestCase
          skip // justify: https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/388
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
        <TestCase itShould="display 1 line of text">
          <View style={{width: 200, backgroundColor: 'silver'}}>
            <Text style={{textAlign: 'left'}} numberOfLines={1}>
              <Text style={{fontSize: 12, backgroundColor: 'cyan'}}>{'>'}</Text>
              <Text style={{fontSize: 8}}>{SAMPLE_PARAGRAPH_TEXT}</Text>
            </Text>
          </View>
        </TestCase>
        <TestCase itShould="display 2 lines of text">
          <Text style={{textAlign: 'left'}} numberOfLines={2}>
            <Text style={{fontSize: 12, backgroundColor: 'cyan'}}>
              {'@@@@@'}
            </Text>
            <Text style={{fontSize: 8}}>{SAMPLE_PARAGRAPH_TEXT}</Text>
          </Text>
        </TestCase>
        <TestCase itShould="display 2 lines of text (placeholder test)">
          <Text style={{textAlign: 'left'}} numberOfLines={2}>
            <View style={{width: 0, height: 8, backgroundColor: 'red'}} />
            <Text style={{fontSize: 8}}>{SAMPLE_PARAGRAPH_TEXT}</Text>
          </Text>
        </TestCase>
        <TestCase itShould="wrap long words">
          <View style={{backgroundColor: 'silver', width: 200}}>
            <Text style={{textAlign: 'left'}}>
              <View style={{width: 8, height: 8, backgroundColor: 'red'}} />
              <Text style={{fontSize: 8}}>
                0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789
              </Text>
            </Text>
          </View>
        </TestCase>
        <TestCase itShould="text should be disabled">
          <TextDisabledTest />
        </TestCase>
        <TestCase
          modal
          itShould="activate onPress() on <Text /> if the touch moves up to 100px above or below the <Text /> body">
          <TextPressRetentionOffsetTest />
        </TestCase>
      </TestSuite>
    </TestSuite>
  );
}
const OnLayoutView = (props: {
  ctx: {
    state: {};
    setState: React.Dispatch<React.SetStateAction<{}>>;
    reset: () => void;
  };
}) => {
  const [layout, setLayout] = useState('');
  const [width, setWidth] = useState(100);
  return (
    <View>
      <Text>{layout}</Text>
      <Text
        style={{
          width: width,
          height: 40,
          borderWidth: 1,
          fontSize: 16,
          backgroundColor: 'rgba(100,100,255,0.5)',
        }}
        onLayout={event => {
          setLayout(JSON.stringify(event.nativeEvent.layout));
          props.ctx.setState(event.nativeEvent.layout);
        }}
        onPress={() => setWidth((prev: number) => (prev === 100 ? 200 : 100))}>
        resize
      </Text>
    </View>
  );
};
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

const TextDisabledTest = () => {
  const [pressCount, setPressCount] = useState(0);
  const [disabled, setDisabled] = useState(false);

  return (
    <View>
      <Text> Press count: {pressCount} </Text>
      <Text disabled={disabled} onPress={() => setPressCount(pressCount + 1)}>
        {SAMPLE_PARAGRAPH_TEXT}
      </Text>
      <Button
        label={disabled ? 'Enable Text' : 'Disable Text'}
        onPress={() => setDisabled(!disabled)}
      />
    </View>
  );
};

const TextPressRetentionOffsetTest = () => {
  const [pressCount, setPressCount] = useState(0);

  return (
    <View style={{height: 500, justifyContent: 'center'}}>
      <Text style={{textAlign: 'center'}}> Press count: {pressCount} </Text>
      <View
        style={{
          backgroundColor: 'lightblue',
          height: 250,
          justifyContent: 'center',
        }}>
        <Text
          style={{
            backgroundColor: 'blue',
            height: 50,
            textAlign: 'center',
            textAlignVertical: 'center',
            color: 'white',
          }}
          onPress={() => setPressCount(pressCount + 1)}
          // @ts-ignore - pressRetentionOffset is not in the type definition
          pressRetentionOffset={{
            bottom: 100,
            left: 0,
            right: 0,
            top: 100,
          }}>
          pressRetentionOffset
        </Text>
      </View>
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
