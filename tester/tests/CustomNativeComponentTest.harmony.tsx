import {TestCase, TestSuite} from '@rnoh/testerino';
import {
  findNodeHandle,
  requireNativeComponent,
  UIManager,
  ViewProps,
} from 'react-native';
import {useRef, useState} from 'react';
import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {Button, Ref} from '../components';

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

type SampleViewRef = {toggleFontSize: () => void};

const SampleViewWrapper = React.forwardRef<
  SampleViewRef,
  {
    children?: any;
    backgroundColor: string;
    size: number;
  }
>(({children, backgroundColor, size}, ref) => {
  const nativeRef = useRef<any>(null);

  React.useImperativeHandle(
    ref,
    () => ({
      toggleFontSize() {
        if (nativeRef?.current) {
          UIManager.dispatchViewManagerCommand(
            findNodeHandle(nativeRef.current),
            'toggleFontSize',
            [],
          );
        }
      },
    }),
    [],
  );

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

  return (
    <SampleView ref={nativeRef} style={style} size={size} children={children} />
  );
});

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
      <TestCase itShould="toggle font size in the component below button (native commands)">
        <Ref<SampleViewRef>
          render={ref => {
            return (
              <>
                <Button
                  label="Toggle Font Size"
                  onPress={() => {
                    ref.current?.toggleFontSize();
                  }}
                />
                <SampleViewWrapper ref={ref} backgroundColor="blue" size={32} />
                ;
              </>
            );
          }}
        />
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
