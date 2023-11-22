import {TestCase, TestSuite} from '@rnoh/testerino';
import {requireNativeComponent, ViewProps} from 'react-native-harmony';
import {useState} from 'react';
import React from 'react';
import {StyleProp, ViewStyle} from 'react-native-harmony';
import {Button} from '../components';

/**
 * 1) SampleView JSI binder on CPP side needs to be provided to make this function work.
 */
const SampleView = requireNativeComponent<ViewProps & {size: number}>(
  'SampleView',
);

/**
 * 2) An alternative to JSI binders and `requireNativeComponent` is `registerViewConfig` function (Harmony-only API).
 * 
    const SampleView = registerViewConfig('SampleView', () => {
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
 */

/**
 * 3) Once code generation is supported, `codegenNativeComponent` will be recommended.
 */

function SampleViewWrapper({
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
        <SampleViewWrapper backgroundColor="red" size={64} />
      </TestCase>
      <TestCase itShould="render green rectangle inside red rectangle">
        <SampleViewWrapper backgroundColor="red" size={64}>
          <SampleViewWrapper backgroundColor="green" size={32} />
        </SampleViewWrapper>
      </TestCase>
      <TestCase itShould="show/hide blue rectangle">
        <SampleViewWrapper backgroundColor="red" size={64}>
          <Blinker>
            <SampleViewWrapper backgroundColor="blue" size={32} />
          </Blinker>
        </SampleViewWrapper>
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
