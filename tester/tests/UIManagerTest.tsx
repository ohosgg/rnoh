import React, {useRef, useState} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';

export function UIManagerTest() {
  const [text, setText] = useState("Measure view above");
  const ref = useRef<View>(null);
  const onPress = () => {
    ref.current?.measure((x, y, width, height, pageX, pageY) => {
      setText(`x: ${x}, y: ${y}, width: ${width}, height: ${height}, pageX: ${pageX}, pageY: ${pageY} `)
    })
  }
  return (
    <TestSuite name="UIManager.measure">
      <TestCase itShould="show the result of ref measure on press">
        <View ref={ref} style={styles.container}>
        </View>
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.text}>{text}</Text>
        </TouchableOpacity>
      </TestCase>
    </TestSuite>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 20,
    backgroundColor: 'red',
  },
  text: {
    height: 60,
  }
});
