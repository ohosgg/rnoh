import {
  processColor,
  registerViewConfig,
  ReactNativeViewAttributes,
  dispatchCommand,
  Platform,
  DeviceEventEmitter,
  findNodeHandle,
  DrawerLayoutAndroid,
  Text,
  RootTag,
  RootTagContext,
  View,
} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';
import {useContext} from 'react';
import React from 'react';
import {Button} from '../components';

export const MiscTest = () => {
  const rootTag: RootTag = useContext(RootTagContext);

  return (
    <TestSuite name="Misc">
      <TestCase itShould="Display the __DEV__ value">
        <Text>{`__DEV__ is ${__DEV__}`}</Text>
      </TestCase>
      <TestCase
        itShould="pass when __DEV__ is defined and have boolean type"
        fn={({expect}) => {
          expect(typeof __DEV__).to.be.eq('boolean');
        }}
      />
      <TestCase
        skip={Platform.OS === 'android'}
        itShould="represent a color as a number"
        fn={({expect}) => {
          expect(processColor('red')).to.be.eq(0xffff0000);
        }}
      />
      {Platform.OS === 'harmony' && (
        <TestCase
          itShould="export harmony specific utils: registerViewConfig, ReactNativeViewAttributes and dispatchCommand"
          fn={({expect}) => {
            expect(registerViewConfig).to.be.not.undefined;
            expect(ReactNativeViewAttributes).to.be.not.undefined;
            expect(dispatchCommand).to.be.not.undefined;
          }}
        />
      )}
      <TestCase
        itShould="export DeviceEventEmitter"
        fn={({expect}) => {
          expect(DeviceEventEmitter).to.be.not.undefined;
        }}
      />
      <TestCase
        itShould="export findNodeHandle"
        fn={({expect}) => {
          expect(findNodeHandle).to.be.not.undefined;
        }}
      />
      <TestCase
        itShould="export DrawerLayoutAndroid"
        fn={({expect}) => {
          expect(DrawerLayoutAndroid).to.be.not.undefined;
        }}
      />
      <TestCase
        itShould="pass when RootTagContext is defined and have sensible value"
        fn={({expect}) => {
          expect(rootTag).to.be.greaterThan(0);
        }}
      />
      <TestCase itShould="have red background color after hiding, updating and showing again">
        <DisplayNoneUpdateTest />
      </TestCase>
    </TestSuite>
  );
};

function DisplayNoneUpdateTest() {
  const [display, setDisplay] = React.useState<'none' | undefined>(undefined);
  const [counter, setCounter] = React.useState(0);
  return (
    <View>
      <Text style={{display, backgroundColor: 'red'}}>{counter}</Text>
      <Button
        onPress={() => setDisplay(display ? undefined : 'none')}
        label={display ? 'Show' : 'Hide'}
      />
      <Button onPress={() => setCounter(counter + 1)} label="Update" />
    </View>
  );
}
