import React from 'react';
import {View, StyleSheet} from 'react-native';

function App(): JSX.Element {
  // return <React.Fragment />;
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
