import {
  Text,
  Touchable,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  View,
  ViewProps,
} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';
import {useState} from 'react';

export const TouchablesTest = () => {
  const [pressCountHighlight, setPressCountHighlight] = useState(0);
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
      <TestCase itShould="show number of presses on press in (TouchableHighlight)">
        <TouchableHighlight
          onPress={() => setPressCountHighlight(pressCountHighlight + 1)}>
          <PressMe endLabel={pressCountHighlight} />
        </TouchableHighlight>
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
      <TestCase
        itShould="handle presses on empty views"
        initialState={false}
        arrange={({setState}) => {
          return (
            <View style={{height: 100, backgroundColor: 'red'}}>
              <TouchableWithoutFeedback onPress={() => setState(true)}>
                <View style={{height: '100%', width: '100%'}} />
              </TouchableWithoutFeedback>
            </View>
          );
        }}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
      <TestCase
        itShould="pass when blue background is pressed"
        initialState={false}
        arrange={({setState}) => (
          <View
            style={{
              backgroundColor: 'blue',
              alignSelf: 'center',
              position: 'relative',
            }}>
            <TouchableWithoutFeedback
              hitSlop={{top: 48, left: 48, bottom: 48, right: 48}}
              onPress={() => {
                setState(true);
              }}>
              <View style={{width: 48, height: 48, margin: 48}} />
            </TouchableWithoutFeedback>
            <View
              style={{
                width: 48,
                height: 48,
                backgroundColor: 'red',
                position: 'absolute',
                top: 48,
                left: 48,
              }}
              onTouchEnd={e => {
                e.stopPropagation();
              }}
            />
          </View>
        )}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
    </TestSuite>
  );
};

function TouchableWithoutFeedbackDemo() {
  const [counter, setCounter] = useState(0);
  return (
    <TouchableWithoutFeedback onPressIn={() => setCounter(prev => prev + 1)}>
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
