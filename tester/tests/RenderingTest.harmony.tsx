import {TestSuite, TestCase} from '@rnoh/testerino';
import React from 'react';
import {useState} from 'react';
import {View, registerViewConfig} from 'react-native';
import {Button} from '../components';
//@ts-ignore
import ReactNativeViewAttributes from 'react-native/Libraries/Components/View/ReactNativeViewAttributes';

const PropsDisplayer = registerViewConfig('PropsDisplayer', () => {
  return {
    uiViewClassName: 'PropsDisplayer',
    bubblingEventTypes: {},
    directEventTypes: {},
    validAttributes: {
      ...ReactNativeViewAttributes.UIView,
    },
  };
});

export function RenderingTest() {
  return (
    <TestSuite name="Rendering">
      <TestCase itShould="change the rectangle's color every second">
        <Timeout
          ms={1000}
          renderItem={refreshKey => (
            <Rectangle
              backgroundColor={refreshKey % 2 === 0 ? 'red' : 'green'}
            />
          )}
        />
      </TestCase>
      <TestCase itShould="show and hide rectangle every second">
        <Timeout
          ms={1000}
          renderItem={refreshKey => (
            <View style={{height: 64}}>
              {refreshKey % 2 === 0 ? (
                <Rectangle backgroundColor={'red'} />
              ) : null}
            </View>
          )}
        />
      </TestCase>
      <TestCase itShould="display all props after pressing the button, not only the recently updated one">
        <Timeout
          ms={0}
          renderItem={refreshColor => {
            return (
              <PropsDisplayer
                style={{
                  backgroundColor: refreshColor % 2 ? 'red' : 'blue',
                  borderWidth: 4,
                  borderColor: 'orange',
                  width: '100%',
                  height: 64,
                }}
              />
            );
          }}
        />
      </TestCase>
    </TestSuite>
  );
}

function Rectangle({backgroundColor}: {backgroundColor: string}) {
  return (
    <View
      style={{
        width: 64,
        height: 64,
        backgroundColor,
      }}
    />
  );
}

function Timeout({
  renderItem,
  ms,
}: {
  renderItem: (refreshKey: number) => any;
  ms: number;
}) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <React.Fragment>
      <Button
        label="Run"
        onPress={() => setTimeout(() => setRefreshKey(prev => (prev += 1)), ms)}
      />
      {renderItem(refreshKey)}
    </React.Fragment>
  );
}
