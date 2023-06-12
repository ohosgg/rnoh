//import React, {useRef} from 'react';
import {TestSuite, TestCase} from '@rnoh/testerino';
import React, {useState, useEffect} from 'react';
import {View, Text, AppState, StyleSheet, AppStateStatus} from 'react-native';

export function AppStateTest() {
  const [appState, setAppState] = useState(AppState.currentState);
  const [appStateHistory, setAppStateHistory] = useState(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setAppState(nextAppState);
      setAppStateHistory(
        (prevAppStateHistory: string) =>
          prevAppStateHistory + ', ' + nextAppState,
      );
    };

    AppState.addEventListener('change', handleAppStateChange);
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  return (
    <TestSuite name="AppState">
      <TestCase
        itShould="return active"
        fn={({expect}) => {
          expect(AppState.currentState).to.equal('active');
        }}
      />
      <TestCase itShould="show AppState history">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            height: 100,
          }}>
          <Text style={styles.text}>Current AppState: {appState}</Text>
          <Text style={styles.text}>AppState history: {appStateHistory}</Text>
        </View>
      </TestCase>
    </TestSuite>
  );
}
const styles = StyleSheet.create({
  text: {
    height: 30,
    width: 350,
    fontSize: 14,
  },
});
