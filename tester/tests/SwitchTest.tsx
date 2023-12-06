import React, {useState} from 'react';
import {View, Switch, StyleSheet, Text} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';

export function SwitchTest() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [event, setEvent] = useState('');
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  return (
    <TestSuite name="Switch">
      <TestCase itShould="Render a working switch and display it's state and SwitchChangeEvent details">
        <View style={styles.container}>
          <Text style={{height: 30}}>
            Switch isEnabled: {isEnabled.toString()}
          </Text>
          <Text style={{height: 30}}>OnChange event: {event}</Text>
          <Switch
            trackColor={{false: 'green', true: 'firebrick'}}
            thumbColor={'beige'}
            onValueChange={toggleSwitch}
            value={isEnabled}
            onChange={e => setEvent(JSON.stringify(e.nativeEvent))}
          />
        </View>
      </TestCase>
      <TestCase itShould="Render a disabled switch">
        <View style={styles.container}>
          <Switch
            trackColor={{false: 'green', true: 'firebrick'}}
            thumbColor={'beige'}
            disabled
          />
        </View>
      </TestCase>
    </TestSuite>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
