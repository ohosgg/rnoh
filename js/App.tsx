import React from 'react';
import {View, StyleSheet, Text} from 'react-native';

function App() {
  return <View style={styles.container}>
    <View style={styles.rect1} />
    <View style={styles.rect2} />
    <Text>Foobar</Text>
  </View>;
}

const styles = StyleSheet.create({
  container: {
    width: 256,
    height: 256,
    backgroundColor: 'red',
  },
  rect1: {
    width: 128,
    height: 128,
    backgroundColor: 'green',
  },
  rect2: {
    marginLeft: 128,
    width: 128,
    height: 128,
    backgroundColor: 'blue',
  }
});

export default App;
