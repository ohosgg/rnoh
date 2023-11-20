import {TestSuite, TestCase} from '@rnoh/testerino';
import React, {useState, useEffect} from 'react';
import {Text, StyleSheet, Dimensions} from 'react-native';

export function DimensionsTest() {
  const [windowDimensions, setWindowDimensions] = useState(
    Dimensions.get('window'),
  );
  const [screenDimensions, setScreenDimensions] = useState(
    Dimensions.get('screen'),
  );

  useEffect(() => {
    const windowSubscription = Dimensions.addEventListener(
      'change',
      ({window}) => setWindowDimensions(window),
    );
    const screenSubscription = Dimensions.addEventListener(
      'change',
      ({screen}) => setScreenDimensions(screen),
    );
    return () => {
      windowSubscription.remove();
      screenSubscription.remove();
    };
  }, []);

  return (
    <TestSuite name="Dimensions">
      <TestCase
        itShould="export dimensions"
        fn={({expect}) => {
          expect(Dimensions).to.not.be.undefined;
          expect(Dimensions.get).to.not.be.undefined;
        }}
      />
      <TestCase
        itShould="gets window dimensions without throwing"
        fn={({expect}) => {
          expect(Dimensions.get.bind(Dimensions, 'window')).to.not.throw();
        }}
      />
      <TestCase
        itShould="gets screen dimensions without throwing"
        fn={({expect}) => {
          expect(Dimensions.get.bind(Dimensions, 'screen')).to.not.throw();
        }}
      />
      <TestCase itShould="display window dimensions">
        <Text style={styles.text}>
          Window dimensions: {JSON.stringify(windowDimensions)}
        </Text>
      </TestCase>
      <TestCase itShould="display screen dimensions">
        <Text style={styles.text}>
          Screen dimensions: {JSON.stringify(screenDimensions)}
        </Text>
      </TestCase>
    </TestSuite>
  );
}
const styles = StyleSheet.create({
  text: {
    fontSize: 14,
  },
});
