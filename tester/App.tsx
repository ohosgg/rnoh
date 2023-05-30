import React from 'react';
import {Tester} from '@rnoh/testerino';
import {View, ScrollView, StyleSheet, Text} from 'react-native';
import * as tests from './tests';
import {ChessboardSample} from './ChessboardSample';
import {NavigationContainer, Page} from './components';
import {Benchmarker, DeepTree} from './benchmarks';

function App() {
  const scrollRef = React.useRef<ScrollView>(null);

  return (
    <NavigationContainer>
      <Page name="TESTS">
        <ScrollView style={styles.container} ref={scrollRef}>
          <Tester>
            {Object.keys(tests).map(testSuiteName => {
              const TestSuite = tests[testSuiteName as keyof typeof tests];
              return <TestSuite key={testSuiteName} />;
            })}
          </Tester>
          <View
            style={styles.button}
            onTouchEnd={() =>
              scrollRef.current?.scrollTo({y: 0, animated: false})
            }>
            <Text style={styles.buttonText}>Scroll To Top</Text>
          </View>
        </ScrollView>
      </Page>
      <Page name="CHESSBOARD EXAMPLE">
        <ChessboardSample />
      </Page>
      <Page name="DEEP TREE BENCHMARK">
        <Benchmarker samplesCount={20}>
          <DeepTree depth={6} breadth={2} id={0} wrap={1} />
        </Benchmarker>
      </Page>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
  },
  button: {
    width: 160,
    height: 36,
    backgroundColor: 'hsl(190, 50%, 70%)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    width: '100%',
    height: '100%',
    fontWeight: 'bold',
  },
});

export default App;
