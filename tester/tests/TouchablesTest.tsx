import {
  Text,
  Touchable,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewProps,
} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';
import {useState} from 'react';

export const TouchablesTest = () => {
  return (
    <TestSuite name="Touchables">
      <TestCase
        itShould="export Touchable"
        fn={({expect}) => {
          expect(Touchable).to.be.not.undefined;
        }}
      />
      <TestCase itShould="use cyan background on press in (TouchableHighlight)">
        <TouchableHighlight
          activeOpacity={1}
          underlayColor="cyan"
          onPress={() => {}}>
          <PressMe />
        </TouchableHighlight>
      </TestCase>
      <TestCase itShould="make the text less visible on press in (TouchableOpacity)">
        <TouchableOpacity onPress={() => {}}>
          <PressMe />
        </TouchableOpacity>
      </TestCase>
      <TestCase
        itShould="export TouchableNativeFeedback (Android only)"
        fn={({expect}) => {
          expect(TouchableNativeFeedback).to.be.not.undefined;
        }}
      />
      <TestCase itShould="handle press without showing feedback">
        <TouchableWithoutFeedbackDemo />
      </TestCase>
    </TestSuite>
  );
};

function TouchableWithoutFeedbackDemo() {
  const [counter, setCounter] = useState(0);
  return (
    <TouchableWithoutFeedback onPressIn={() => setCounter(prev => prev+1)}>
        <PressMe endLabel={counter} />
    </TouchableWithoutFeedback>
  );
}

function PressMe(props: ViewProps & {endLabel?: string | number}) {
  return (
    <View {...props} style={{padding: 16, borderWidth: 1}}>
      <Text style={{color: 'blue', height: 24, width: '100%'}}>
        Press me{props.endLabel !== undefined ? ` (${props.endLabel})` : ''}
      </Text>
    </View>
  );
}
