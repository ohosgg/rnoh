import React, {useState} from 'react';

import {StyleSheet, StatusBar, Text, View, StatusBarStyle} from 'react-native';

import {TestCase, TestSuite} from '@rnoh/testerino';

export function StatusBarTest() {
  return (
    <TestSuite name="Status bar">
      <StatusBarView />
    </TestSuite>
  );
}
const STYLES = ['default', 'dark-content', 'light-content'] as const;
const BACKGROUND_COLORS = ['#FF000088', '#00FF0088'];

function StatusBarView() {
  const [hidden, setHidden] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(BACKGROUND_COLORS[0]);
  const [statusBarStyle, setStatusBarStyle] = useState<StatusBarStyle>(
    STYLES[0],
  );
  const [translucent, setTranslucent] = useState(false);

  const changeStatusBarStyle = () => {
    const styleId = STYLES.indexOf(statusBarStyle) + 1;
    if (styleId === STYLES.length) {
      setStatusBarStyle(STYLES[0]);
    } else {
      setStatusBarStyle(STYLES[styleId]);
    }
  };
  const changeBackgroundColor = () => {
    setBackgroundColor(prevColor => {
      const newColorId = BACKGROUND_COLORS.indexOf(prevColor) + 1;
      return BACKGROUND_COLORS[
        newColorId === BACKGROUND_COLORS.length ? 0 : newColorId
      ];
    });
  };

  return (
    <View>
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle={statusBarStyle}
        hidden={hidden}
        translucent={translucent}
      />
      <TestCase itShould="toggle status bar visibility">
        <View
          style={styles.button}
          onTouchEnd={() => {
            setHidden(!hidden);
          }}>
          <Text style={styles.buttonText}>{hidden ? 'hidden' : 'visible'}</Text>
        </View>
      </TestCase>
      <TestCase itShould="toggle status bar background color(red/green), with alpha 88">
        <View
          style={styles.button}
          onTouchEnd={() => {
            changeBackgroundColor();
          }}>
          <Text style={styles.buttonText}>{backgroundColor}</Text>
        </View>
      </TestCase>
      <TestCase itShould="toggle status bar style (light-content(default)/dark-content) ">
        <View
          style={styles.button}
          onTouchEnd={() => {
            changeStatusBarStyle();
          }}>
          <Text style={styles.buttonText}>{statusBarStyle}</Text>
        </View>
      </TestCase>
      <TestCase itShould="toggle status bar translucent">
        <View
          style={styles.button}
          onTouchEnd={() => {
            setTranslucent(!translucent);
          }}>
          <Text style={styles.buttonText}>
            {translucent ? 'translucent' : 'non-translucent'}
          </Text>
        </View>
      </TestCase>
      <TestCase itShould="set status bar color to blue (StatusBar.setBackgroundColor)">
        <View
          style={styles.button}
          onTouchEnd={() => {
            StatusBar.setBackgroundColor('#0000FF88');
          }}>
          <Text style={styles.buttonText}>Set blue</Text>
        </View>
      </TestCase>
      <TestCase itShould="set status bar dark style (light-content(default)/dark-content) (StatusBar.setBarStyle) ">
        <View
          style={styles.button}
          onTouchEnd={() => {
            StatusBar.setBarStyle('dark-content')
          }}>
          <Text style={styles.buttonText}>Set dark-content</Text>
        </View>
      </TestCase>
      <TestCase itShould="set status bar translucent (StatusBar.setTranslucent)">
        <View
          style={styles.button}
          onTouchEnd={() => {
            StatusBar.setTranslucent(true);
          }}>
          <Text style={styles.buttonText}>
            Set translucent
          </Text>
        </View>
      </TestCase>
      <TestCase
        itShould="return correct status bar height for device"
        fn={({expect}) => {
          expect(StatusBar.currentHeight).to.be.closeTo(38.8, 0.1);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 160,
    height: 40,
    backgroundColor: 'red',
    paddingHorizontal: 16,
  },
  buttonText: {
    width: '100%',
    height: '100%',
    fontWeight: 'bold',
    color: 'white',
  },
});
