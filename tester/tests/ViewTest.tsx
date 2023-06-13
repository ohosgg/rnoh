import {Text, View, UIManager} from 'react-native';
import {TestSuite, TestCase} from '@rnoh/testerino';
import React, {useEffect} from 'react';

export function ViewTest() {
  return (
    <TestSuite name="View">
      <TestCase itShould="render square with transparent background on gray background">
        <View style={{width: '100%', height: 100, backgroundColor: 'gray'}}>
          <View
            style={{
              width: 100,
              height: 100,
              borderWidth: 3,
              borderColor: 'white',
            }}
          />
        </View>
      </TestCase>
      <TestCase itShould="display component dimensions">
        <View style={{width: '100%', height: 96}}>
          <DimensionsDisplayer />
        </View>
      </TestCase>
    </TestSuite>
  );
}

function DimensionsDisplayer() {
  const [dimensions, setDimensions] = React.useState({width: 0, height: 0});
  const viewRef = React.useRef<View>(null);

  useEffect(() => {
    viewRef.current?.measure((_x, _y, width, height) => {
      setDimensions({width, height});
    });
  }, []);

  return (
    <View
      ref={viewRef}
      style={{backgroundColor: 'blue', width: 96, height: 32}}>
      <Text style={{width: '100%', height: '100%', color: 'white'}}>
        width: {dimensions.width} height: {dimensions.height}
      </Text>
    </View>
  );
}
