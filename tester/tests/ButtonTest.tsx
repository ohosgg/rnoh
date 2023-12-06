import React from 'react';
import {View, Button, StyleSheet, Text} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';

export const ButtonTest = () => {
  return (
    <TestSuite name="Button">
      <TestCase itShould="render a button with a title ">
        <ButtonView />
      </TestCase>
      <TestCase itShould="render a button that should be disabled">
        <ButtonDisabled />
      </TestCase>
      <TestCase
        itShould="render a button with touchSoundDisabled"
        skip // prop doesnt exist on native side https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/476
      >
        <ButtonTouchSoundDisabled />
      </TestCase>
      <TestCase itShould="render a button with accessibility label">
        <ButtonAccessibilityLabel />
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

function ButtonTouchSoundDisabled() {
  const [pressCounter, setPressCounter] = React.useState(0);
  const [touchSoundDisabled, setTouchSoundDisabled] = React.useState(false);

  const incrementPressCounter = () => {
    setPressCounter(count => count + 1);
  };

  const toggle = () => {
    setTouchSoundDisabled(!touchSoundDisabled);
  };

  return (
    <View>
      <View style={styles.buttonsContainer}>
        <Button
          title={'Press me! ' + (touchSoundDisabled ? '(no sound)' : '')}
          color="#FF0000"
          onPress={incrementPressCounter}
          touchSoundDisabled={touchSoundDisabled}
        />
        <Button
          title={
            touchSoundDisabled ? 'Enable Touch Sound' : 'Disable Touch Sound'
          }
          color="#A4A4A4"
          onPress={toggle}
          touchSoundDisabled={false}
        />
      </View>
      <Text style={styles.text}>Pressed {pressCounter} times</Text>
    </View>
  );
}

function ButtonDisabled() {
  const [pressCounter, setPressCounter] = React.useState(0);
  const [disabled, setDisabled] = React.useState(false);

  const incrementPressCounter = () => {
    setPressCounter(count => count + 1);
  };

  const toggle = () => {
    setDisabled(!disabled);
  };

  return (
    <View>
      <View style={styles.buttonsContainer}>
        <Button
          title={disabled ? '(disabled)' : 'Press Me'}
          color="#FF0000"
          onPress={incrementPressCounter}
          disabled={disabled}
        />
        <Button
          title={disabled ? 'Enable button click' : 'Disable button click'}
          color="#A4A4A4"
          onPress={toggle}
        />
      </View>
      <Text style={styles.text}>Pressed {pressCounter} times</Text>
    </View>
  );
}

function ButtonAccessibilityLabel() {
  const [pressCounter, setPressCounter] = React.useState(0);

  const incrementPressCounter = () => {
    setPressCounter(count => count + 1);
  };

  return (
    <View>
      <View style={styles.buttonsContainer}>
        <Button
          title={'Increment the count'}
          color="#FF0000"
          onPress={incrementPressCounter}
          accessibilityLabel="Increment the count"
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
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  text: {
    height: 20,
    width: 200,
    fontSize: 14,
  },
});
