import React from 'react';
import {View, StyleSheet, Text} from 'react-native';

function App() {
  const [flag, setFlag] = React.useState(false);

  return <View style={styles.container}>
    <View style={flag ? styles.rect1 : styles.rect2} onTouchStart={() => setFlag(current => !current)} />
    <View style={flag ? styles.rect2 : styles.rect1} onTouchEnd={() => setFlag(current => !current)} />
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
