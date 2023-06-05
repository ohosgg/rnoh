import {TestCase, TestSuite} from '@rnoh/testerino';
//@ts-ignore
import {register} from 'react-native/Libraries/Renderer/shims/ReactNativeViewConfigRegistry';
//@ts-ignore
import ReactNativeViewAttributes from 'react-native/Libraries/Components/View/ReactNativeViewAttributes';
import {useEffect, useState} from 'react';
import React from 'react';

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
  return (
    <SampleView
      style={{
        backgroundColor: backgroundColor,
        width: size,
        height: size,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'pink',
      }}
      size={size}
      children={children}
    />
  );
}

export function CustomNativeComponentTest() {
  return (
    <TestSuite name="Custom Native Component">
      <TestCase itShould="render red rectangle">
        <NativeComponent backgroundColor="red" size={64} />
      </TestCase>
      <TestCase itShould="render green rectangle inside red rectangle">
        <NativeComponent backgroundColor="red" size={64}>
          <NativeComponent backgroundColor="green" size={32} />
        </NativeComponent>
      </TestCase>
      <TestCase itShould="render green rectangle blinking every second">
        <NativeComponent backgroundColor="red" size={64}>
          <Blinker>
            <NativeComponent backgroundColor="green" size={32} />
          </Blinker>
        </NativeComponent>
      </TestCase>
    </TestSuite>
  );
}

function Blinker({children}: any) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsVisible(prev => !prev);
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return <React.Fragment>{isVisible && children}</React.Fragment>;
}
