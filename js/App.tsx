import React from 'react';
import { View, StyleSheet, Image, Text, TextInput } from 'react-native';

const HUAWEI_LOGO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaj2LyrXUzyYuP6G7DKWJXC48kA2atLmUpgw&usqp=CAU";

function App() {
  const [flag, setFlag] = React.useState(false);

  return <View style={styles.container}>
    <View style={flag ? styles.rect1 : styles.rect2} onTouchStart={() => setFlag(current => !current)} />
    <View style={flag ? styles.rect2 : styles.rect1} onTouchEnd={() => setFlag(current => !current)}>
      <Image style={styles.image} source={{ uri: HUAWEI_LOGO_URL }} />
    </View>
    <TextInput style={styles.textInput} />
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
  },
  image: {
    width: 96,
    height: 96,
  },
  textInput: {
    width: 256,
    height: 96,
  }
});

export default App;
