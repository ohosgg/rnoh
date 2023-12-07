import {TestCase, TestSuite} from '@rnoh/testerino';
import React, {useEffect, useState} from 'react';
import {GestureResponderEvent, ScrollView, TextInput} from 'react-native';
import {
  AppState,
  AppStateStatus,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {Button, Effect} from '../components';

export function AppStateTest() {
  return (
    <TestSuite name="AppState">
      <TestCase
        itShould="return active"
        fn={({expect}) => {
          expect(AppState.currentState).to.equal('active');
        }}
      />
      <TestCase itShould="show AppState history">
        <AppStateHistoryView />
      </TestCase>
      <TestCase skip itShould="show focus history">
        <FocusHistoryView />
      </TestCase>
      <TestCase
        skip
        itShould="throw memory warning event after adding too much items"
        initialState={{
          didEmitMemoryEvent: false,
          childrenCount: 1,
          textInputValue: '99',
        }}
        arrange={({setState, state}) => {
          return (
            <View>
              <Effect
                onMount={() => {
                  AppState.addEventListener('memoryWarning', () => {
                    setState(prev => ({...prev, didEmitMemoryEvent: true}));
                  });
                }}
                children={<></>}
              />
              <View style={{flexDirection: 'row'}}>
                <Text>Number of items to add</Text>
                <TextInput
                  value={state.textInputValue}
                  onChange={e => {
                    e.persist();
                    setState(prev => ({
                      ...prev,
                      textInputValue: e.nativeEvent?.text,
                    }));
                  }}
                  style={{borderWidth: 1, width: 50, marginLeft: 10}}
                  maxLength={6}
                />
              </View>
              <Text>Items: {state.childrenCount}</Text>
              <Button
                onPress={() => {
                  setState(prev => ({
                    ...prev,
                    childrenCount:
                      prev.childrenCount + parseInt(state.textInputValue, 10),
                  }));
                }}
                label="Add"
              />
              <ScrollView
                {...COMMON_PROPS}
                nestedScrollEnabled
                children={getScrollViewContent({
                  amountOfChildren: state.childrenCount,
                })}
                style={{
                  height: 100,
                }}
              />
            </View>
          );
        }}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
    </TestSuite>
  );
}
const FocusHistoryView = () => {
  const [focusHistory, setFocusHistory] = useState('focused');

  useEffect(() => {
    const handleFocusChange = (focusState: 'blurred' | 'focused') => () => {
      setFocusHistory((prev: string) => `${prev}, ${focusState}`);
    };

    AppState.addEventListener('blur', handleFocusChange('blurred'));
    AppState.addEventListener('focus', handleFocusChange('focused'));
  }, []);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text style={styles.text}>Focus history: {focusHistory}</Text>
    </View>
  );
};

const COMMON_PROPS = {
  style: {
    borderWidth: 3,
    borderColor: 'firebrick',
  },
  contentContainerStyle: {
    alignItems: 'center' as 'center',
    justifyContent: 'center' as 'center',
  },
  children: getScrollViewContent({}),
};

interface ScrollViewContentProps {
  style?: StyleProp<ViewStyle>;
  amountOfChildren?: number;
  onTouchEnd?: (event: GestureResponderEvent) => void;
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto' | undefined;
}
// using this as a component breaks sticky headers because react native sees it then as a single component
function getScrollViewContent({
  style,
  amountOfChildren = 20,
  onTouchEnd,
  pointerEvents,
}: ScrollViewContentProps) {
  return new Array(amountOfChildren).fill(0).map((_, idx) => {
    return (
      <View
        key={idx}
        style={[
          {
            width: '100%',
            height: 50,
            backgroundColor: idx % 2 ? 'pink' : 'beige',
            justifyContent: 'center',
          },
          style,
        ]}
        pointerEvents={pointerEvents}
        onTouchEnd={onTouchEnd}>
        <Text style={{textAlign: 'center', height: 15}}> {idx + 1}</Text>
      </View>
    );
  });
}

const AppStateHistoryView = () => {
  const [appState, setAppState] = useState(AppState.currentState);
  const [appStateHistory, setAppStateHistory] = useState(
    AppState.currentState.toString(),
  );

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setAppState(nextAppState);
      setAppStateHistory(
        (prevAppStateHistory: string) =>
          prevAppStateHistory + ', ' + nextAppState,
      );
    };

    AppState.addEventListener('change', handleAppStateChange);
  }, []);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text style={styles.text}>Current AppState: {appState}</Text>
      <Text style={styles.text}>AppState history: {appStateHistory}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    marginBottom: 10,
    fontSize: 14,
  },
});
