import React from 'react';
import {Tester} from '@rnoh/testerino';
import {Image, ScrollView, StyleSheet} from 'react-native';
import * as tests from './tests';
import {
  AnimationsExample,
  CheckerboardExample,
  ChessboardExample,
  TextScrollExample,
  CursorExample,
  ImageGalleryExample,
  FlatListVsScrollViewExample,
  LargeImageScrollExample,
} from './examples';
import {Button, NavigationContainer, Page} from './components';
import {Benchmarker, DeepTree, SierpinskiTriangle} from './benchmarks';

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
          <Button
            label="Scroll to Top"
            onPress={() => {
              scrollRef.current?.scrollTo({y: 0, animated: false});
            }}
          />
        </ScrollView>
      </Page>
      <Page name="BENCHMARK: DEEP TREE">
        <Benchmarker
          samplesCount={0}
          renderContent={refreshKey =>
            refreshKey % 2 === 0 ? (
              <DeepTree depth={9} breadth={2} id={0} wrap={1} />
            ) : null
          }
        />
      </Page>
      <Page name="BENCHMARK: DEEP TREE (20 samples)">
        <Benchmarker
          samplesCount={20}
          renderContent={refreshKey =>
            refreshKey % 2 === 0 ? (
              <DeepTree depth={6} breadth={2} id={0} wrap={1} />
            ) : null
          }
        />
      </Page>
      <Page name="BENCHMARK: UPDATING COLORS">
        <Benchmarker
          samplesCount={100}
          renderContent={refreshKey => (
            <SierpinskiTriangle
              s={150}
              x={150}
              y={75}
              depth={1}
              renderCount={refreshKey}
            />
          )}
        />
      </Page>
      <Page name="BENCHMARK: UPDATING LAYOUT">
        <Benchmarker
          samplesCount={200}
          renderContent={refreshKey => (
            <SierpinskiTriangle
              s={refreshKey}
              x={160}
              y={75}
              depth={1}
              renderCount={refreshKey}
            />
          )}
        />
      </Page>
      <Page name="EXAMPLE: ANIMATIONS">
        <AnimationsExample />
      </Page>
      <Page name="EXAMPLE: CHECKERBOARD">
        <CheckerboardExample />
      </Page>
      <Page name="EXAMPLE: CHESSBOARD">
        <ChessboardExample />
      </Page>
      <Page name="EXAMPLE: CURSOR">
        <CursorExample />
      </Page>
      <Page name="EXAMPLE: IMAGE GALLERY">
        <ImageGalleryExample />
      </Page>
      <Page name="EXAMPLE: LARGE IMAGE SCROLL">
        <LargeImageScrollExample />
      </Page>
      <Page name="EXAMPLE: TEXTSCROLL">
        <TextScrollExample />
      </Page>
      <Page name="EXAMPLE: FLATLIST VS SCROLLVIEW">
        <FlatListVsScrollViewExample />
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
});

export default App;
