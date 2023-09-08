import {TestSuite, TestCase} from '@rnoh/testerino';
import {useEffect, useState} from 'react';
import {ActivityIndicator} from 'react-native';

// https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/290
export function ActivityIndicatorTest() {
  return (
    <TestSuite name="ActivityIndicator">
      <TestCase itShould="display small, gray and animated loading indicator">
        <ActivityIndicator />
      </TestCase>
      <TestCase itShould="enable and disable loading every 500 ms">
        <Interval
          ms={500}
          render={refreshKey => {
            return <ActivityIndicator animating={refreshKey % 2 === 0} />;
          }}
        />
      </TestCase>
      <TestCase itShould="display red loading indicator">
        <ActivityIndicator color={'red'} />
      </TestCase>
      <TestCase itShould="display large loading indicator">
        <ActivityIndicator size="large" />
      </TestCase>
    </TestSuite>
  );
}

function Interval({
  render,
  ms,
}: {
  ms: number;
  render: (refreshKey: number) => any;
}) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, ms);
    return () => {
      clearInterval(interval);
    };
  }, [ms]);

  return render(refreshKey);
}
