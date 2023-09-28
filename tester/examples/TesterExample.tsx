import {Tester, Filter} from '@rnoh/testerino';
import * as React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import * as tests from '../tests';

export function TesterExample({filter}: {filter: Filter}) {
  const scrollRef = React.useRef<ScrollView>(null);

  return (
    <Tester filter={filter}>
      <ScrollView style={styles.container} ref={scrollRef}>
        {Object.keys(tests).map(testSuiteName => {
          const TestSuite = tests[testSuiteName as keyof typeof tests];
          return <TestSuite key={testSuiteName} />;
        })}
      </ScrollView>
    </Tester>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
  },
});
