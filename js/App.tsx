import React from 'react';
import {StyleSheet, View} from 'react-native';

function App(): JSX.Element {
  return <View style={styles.square} />;
}

const styles = StyleSheet.create({
  square: {
    width: 96,
    height: 96,
    backgroundColor: 'red',
  },
});

export default App;
