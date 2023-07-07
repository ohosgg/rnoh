import React, {useState} from 'react';
import {Image, ScrollView, StyleSheet, TextInput, View} from 'react-native';

export function LargeImageScrollExample() {
  const [numberOfComponents, setNumberOfComponents] = useState(300);

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.textInput}
        value={numberOfComponents.toString()}
        onChangeText={value => {
          setNumberOfComponents(parseInt(value) || 0);
        }}
      />

      {new Array(numberOfComponents).fill(0).map((_, idx) => (
        <View style={styles.imageContainer}>
          <Image
            key={idx}
            source={require('../assets/placeholder2000x2000.jpg')}
            style={styles.image}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
  },
  textInput: {
    backgroundColor: 'white',
    width: '100%',
    height: 36,
    color: 'black',
  },
});
