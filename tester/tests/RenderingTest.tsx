import React from 'react';
import {TestSuite} from '@rnoh/testerino';
import {Text} from 'react-native';

export function RenderingTest() {
  return (
    <TestSuite name="Rendering">
      <Text style={{height: 20, color: 'white'}}>Platform not supported</Text>
    </TestSuite>
  );
}
