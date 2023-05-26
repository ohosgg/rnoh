import React from 'react';
import {TestSuite, TestCase} from '@rnoh/testerino';

export function CustomNativeComponentTest() {
  return (
    <TestSuite name="Custom Native Component">
      <TestCase itShould="platform not supported" fn={() => {}} />
    </TestSuite>
  );
}
