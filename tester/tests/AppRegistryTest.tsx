import {TestSuite, TestCase} from '@rnoh/testerino';
import React from 'react';
import {InitialParamsContext} from '../contexts';

export function AppRegistryTest() {
  const initialProps = React.useContext<any>(InitialParamsContext);

  return (
    <TestSuite name="AppRegistry">
      <TestCase
        itShould="receive initialParams from the native side"
        fn={({expect}) => {
          expect(initialProps).not.to.be.undefined;
        }}
      />
    </TestSuite>
  );
}
