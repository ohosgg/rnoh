import React, {useState} from 'react';
import {View, Button, StyleSheet, Text} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';

export const ButtonTest = () => {
  return (
    <TestSuite name="Button">
      <TestCase itShould="[FAILS] Render a button with a title ">
        <ButtonView />
      </TestCase>
    </TestSuite>
  );
};
function ButtonView() {
  const [pressCounter, setPressCounter] = React.useState(0);
  const incrementPressCounter = () => {
    setPressCounter(count => count + 1);
  };

  return (
    <View>
      <View style={styles.buttonContainer}>
        <Button
          title="Press me!"
          color="#FF0000"
          onPress={incrementPressCounter}
        />
      </View>
      <Text style={styles.text}>Pressed {pressCounter} times</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  buttonContainer: {
    width: 80,
    height: 80,
  },
  text: {
    height: 20,
    width: 200,
    fontSize: 14,
  },
});