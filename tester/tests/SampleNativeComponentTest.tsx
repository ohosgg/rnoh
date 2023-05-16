import {TestCase, TestSuite} from '@rnoh/testerino';
//@ts-ignore
import {register} from 'react-native/Libraries/Renderer/shims/ReactNativeViewConfigRegistry';
//@ts-ignore
import ReactNativeViewAttributes from 'react-native/Libraries/Components/View/ReactNativeViewAttributes';

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

export function SampleNativeComponentTest() {
  return (
    <TestSuite name="Sample Native Component">
      <TestCase itShould="render red rectangle">
        <SampleView
          style={{backgroundColor: 'red', width: 150, height: 150}}
          size={100}
        />
      </TestCase>
    </TestSuite>
  );
}
