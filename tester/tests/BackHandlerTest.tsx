import {BackHandler, Text, TouchableOpacity, View} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';

export const BackHandlerTest = () => {
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
    </TestSuite>
  );
};
