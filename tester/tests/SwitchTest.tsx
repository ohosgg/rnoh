import React, {useState} from 'react';
import {View, Switch, StyleSheet, Text} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';

export function SwitchTest() {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  return (
    <TestSuite name="Switch">
      <TestCase itShould="Render a working switch and display it's state">
        <View style={styles.container}>
          <Text style={{height: 30}}>
            Switch isEnabled: {isEnabled.toString()}
          </Text>
          <Switch
            trackColor={{false: 'green', true: 'firebrick'}}
            thumbColor={'beige'}
            onValueChange={toggleSwitch}
            value={isEnabled}
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
