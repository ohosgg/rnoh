import React, {useState} from 'react';
import {View, Switch, StyleSheet} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';

export const SwitchTest = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  return (
    <TestSuite name="Switch">
      <TestCase itShould="Render a working switch ">
        <View style={styles.container}>
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
      </TestCase>
    </TestSuite>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SwitchTest;
