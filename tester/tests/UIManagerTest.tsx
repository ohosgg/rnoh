import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, UIManager, findNodeHandle } from 'react-native';
import { TestCase, TestSuite } from '@rnoh/testerino';
import { Button } from '../components';

export function UIManagerTest() {
  return (
    <TestSuite name="UIManager.measure">
      <TestCase itShould="show the result of ref measure on press">
        <MeasureTest />
      </TestCase>
      <TestCase itShould="scroll down on press">
        <DispatchCommandTest />
      </TestCase>
      <TestCase itShould="return view manager config" fn={({expect}) => {
        expect(UIManager.getViewManagerConfig("RCTView")).to.be.an('object');
      }} />
      <TestCase itShould="not return view manager config for non-existing view" fn={({expect}) => {
        expect(UIManager.getViewManagerConfig("RCTNotAView")).to.be.null;
      }} />
      <TestCase itShould="check if view manager config exists" fn={({expect}) => {
        expect(UIManager.hasViewManagerConfig("RCTView")).to.be.true;
        expect(UIManager.hasViewManagerConfig("RCTNotAView")).to.be.false;
      }} />
    </TestSuite>
  );
}

function MeasureTest() {
  const [text, setText] = useState('Measure view above');
  const ref = useRef<View>(null);
  const onPress = () => {
    ref.current?.measure((x, y, width, height, pageX, pageY) => {
      setText(
        `x: ${x}, y: ${y}, width: ${width}, height: ${height}, pageX: ${pageX}, pageY: ${pageY} `,
      );
    });
  };
  return (
    <>
      <View ref={ref} style={styles.container}></View>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.text}>{text}</Text>
      </TouchableOpacity>
    </>
  )
}

function DispatchCommandTest() {
  const ref = useRef<ScrollView>(null);

  return (
    <View>
      <ScrollView ref={ref} style={{ height: 100 }}>
        <View style={[styles.box, { backgroundColor: 'red' }]} />
        <View style={[styles.box, { backgroundColor: 'blue' }]} />
      </ScrollView>
      <Button label="scroll to bottom" onPress={() => {
        UIManager.dispatchViewManagerCommand(findNodeHandle(ref.current), "scrollToEnd", [true])
      }} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 20,
    backgroundColor: 'red',
  },
  box: {
    height: 100,
    width: 50,
  },
  text: {
    height: 60,
  },
});
