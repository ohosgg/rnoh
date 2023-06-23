import {TestCase, TestSuite} from '@rnoh/testerino';
//@ts-ignore
import {register} from 'react-native/Libraries/Renderer/shims/ReactNativeViewConfigRegistry';
//@ts-ignore
import ReactNativeViewAttributes from 'react-native/Libraries/Components/View/ReactNativeViewAttributes';
import {useEffect, useState} from 'react';
import React from 'react';
import {Button} from '../components';
import {StyleProp, View, ViewStyle} from 'react-native';

const SampleView = register('SampleView', () => {
  return {
    uiViewClassName: 'SampleView',
    bubblingEventTypes: {},
    directEventTypes: {},
    validAttributes: {
      ...ReactNativeViewAttributes.UIView,
      size: true,
    },
  };
});

function NativeComponent({
  children,
  backgroundColor,
  size,
}: {
  children?: any;
  backgroundColor: string;
  size: number;
}) {
  const style: StyleProp<ViewStyle> = {
    backgroundColor: backgroundColor,
    width: size,
    height: size,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'green',
    borderWidth: 1,
    borderRadius: 4,
    opacity: 1,
  };

  return <SampleView style={style} size={size} children={children} />;
}

export function CustomNativeComponentTest() {
  return (
    <TestSuite name="Custom Native Component">
      <TestCase itShould="render red rectangle">
        <NativeComponent backgroundColor="red" size={64} />
      </TestCase>
      <TestCase itShould="render blue rectangle inside red rectangle">
        <NativeComponent backgroundColor="red" size={64}>
          <NativeComponent backgroundColor="blue" size={32} />
        </NativeComponent>
      </TestCase>
      <TestCase itShould="show/hide blue rectangle">
        <NativeComponent backgroundColor="red" size={64}>
          <Blinker>
            <NativeComponent backgroundColor="blue" size={32} />
          </Blinker>
        </NativeComponent>
      </TestCase>
    </TestSuite>
  );
}

function Blinker({children}: any) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <React.Fragment>
      <Button
        label="Run"
        onPress={() => {
          setIsVisible(prev => !prev);
        }}
      />
      {isVisible && children}
    </React.Fragment>
  );
}
