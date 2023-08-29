import {StyleSheet, Text, TextInput, View} from 'react-native';
import {TestSuite, TestCase} from '@rnoh/testerino';
import {useState} from 'react';

export function TextInputTest() {
  const [text, onChangeText] = useState('');

  return (
    <TestSuite name="TextInput">
      <TestCase
        modal
        itShould="render textinput and change the text component based on the values inputted">
        <Text style={styles.text}>{text}</Text>
        <TextInput
          style={styles.textInput}
          value={text}
          onChangeText={onChangeText}
        />
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
    height: 40,
  },
  textInput: {
    height: 40, // hack
    fontSize: 16,
    color: 'black',
  },
});
