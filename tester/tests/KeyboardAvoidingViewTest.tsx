import {
  Keyboard,
  KeyboardAvoidingView,
  StyleProp,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';
import React from 'react';
import {Modal} from '../components';

export const KeyboardAvoidingViewTest = () => {
  return (
    <TestSuite name="KeyboardAvoidingView">
      <TestCase itShould="don't avoid keyboard">
        <KeyboardAvoidingViewTestCase
          behavior="height"
          justifyContent="space-around"
          enabled={false}
        />
      </TestCase>
      <TestCase itShould="avoid keyboard by changing height">
        <KeyboardAvoidingViewTestCase
          behavior="height"
          justifyContent="space-around"
        />
      </TestCase>
      <TestCase itShould="avoid keyboard by changing position. The firebrick border should move, the green one shouldn't">
        <KeyboardAvoidingViewTestCase
          behavior="position"
          justifyContent="flex-end"
          contentContainerStyle={{borderWidth: 4, borderColor: 'firebrick'}}
          style={{borderWidth: 4, borderColor: 'green'}}
        />
      </TestCase>
      <TestCase itShould="avoid keyboard by changing padding">
        <KeyboardAvoidingViewTestCase
          behavior="padding"
          justifyContent="flex-end"
        />
      </TestCase>
    </TestSuite>
  );
};

type KeyboardAvoidingViewTestCaseProps = {
  behavior?: 'height' | 'position' | 'padding' | undefined;
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
    | undefined;
  contentContainerStyle?: StyleProp<ViewStyle> | undefined;
  enabled?: boolean | undefined;
  style?: StyleProp<ViewStyle> | undefined;
};
function KeyboardAvoidingViewTestCase(
  props: KeyboardAvoidingViewTestCaseProps,
) {
  return (
    <>
      <Modal contentContainerStyle={{height: '100%'}}>
        <KeyboardAvoidingView
          behavior={props.behavior}
          keyboardVerticalOffset={75} //magic value, corresponding to the height of the wrapper etc.
          enabled={props.enabled}
          contentContainerStyle={props.contentContainerStyle}
          style={[styles.container, props.style]}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              style={{height: '100%', justifyContent: props.justifyContent}}>
              <TextInput placeholder="TextInput" style={styles.textInput} />
              <View
                style={{height: 150, width: 150, backgroundColor: 'firebrick'}}
              />
              <View
                style={{height: 150, width: 150, backgroundColor: 'beige'}}
              />
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
  textInput: {
    height: 40,
    borderColor: '#000000',
    borderWidth: 1,
    marginBottom: 36,
  },
});
