import {Tester} from '@rnoh/testerino';
import * as React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import * as tests from '../tests';
import {Button} from '../components';

export function TesterExample() {
  const scrollRef = React.useRef<ScrollView>(null);

  return (
    <ScrollView style={styles.container} ref={scrollRef}>
      <Tester>
        {Object.keys(tests).map(testSuiteName => {
          const TestSuite = tests[testSuiteName as keyof typeof tests];
          return <TestSuite key={testSuiteName} />;
        })}
      </Tester>
      <Button
        label="Scroll to Top"
        onPress={() => {
          scrollRef.current?.scrollTo({y: 0, animated: false});
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
  },
});
