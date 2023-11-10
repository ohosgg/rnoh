import {Tester, Filter} from '@rnoh/testerino';
import * as React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {TextTest} from '../tests';

export function TextTestsExample({filter}: {filter: Filter}) {
  return (
    <Tester filter={filter}>
      <ScrollView style={styles.container}>
        <Tester>
          <ScrollView>
            <TextTest />
          </ScrollView>
        </Tester>
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
