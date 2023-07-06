import {BackHandler, Text, TouchableOpacity, View} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';
import { useState } from 'react';

export const BackHandlerTest = () => {

  const [counter, setCounter] = useState(0);

  BackHandler.addEventListener('hardwareBackPress', () => {
    setCounter(counter + 1);
    return true;
  });

  return (
    <TestSuite name="BackHandler">
      <TestCase
        itShould="be exported"
        fn={({expect}) => {
          expect(BackHandler).to.be.not.undefined;
        }}
      />
      <TestCase itShould="[FAILS] exit app on press">
        <TouchableOpacity
          style={{height: 64}}
          onPress={() => {
            BackHandler.exitApp();
          }}>
          <Text style={{width: '100%', height: '100%'}}>Exit</Text>
        </TouchableOpacity>
      </TestCase>
      <TestCase itShould="display number of back presses">
        <View style={{height: 64}}>
          <Text style={{width: '100%', height: '100%'}}>Back pressed {counter} time{counter == 1 ? '' : 's'}</Text>
        </View>
      </TestCase>
    </TestSuite>
  );
};
