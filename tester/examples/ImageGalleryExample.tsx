import React, {useState} from 'react';
import {Image, ScrollView, StyleSheet, TextInput, View} from 'react-native';

export function ImageGalleryExample() {
  const [numberOfComponents, setNumberOfComponents] = useState(300);

  return (
    <ScrollView style={{flex: 1}}>
      <View style={{flexDirection: 'column'}}>
        <TextInput
          style={styles.textInput}
          value={numberOfComponents.toString()}
          onChangeText={value => {
            setNumberOfComponents(parseInt(value) || 0);
          }}
        />
        <View style={styles.gallery}>
          {new Array(numberOfComponents).fill(0).map((_, idx) => {
            return (
              <Image
                key={idx}
                source={require('../assets/placeholder2000x2000.jpg')}
                style={styles.image}
              />
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  image: {
    width: '33.333%',
    aspectRatio: 1,
  },
  textInput: {
    backgroundColor: 'white',
    width: '100%',
    height: 36,
    color: 'black',
  },
  gallery: {
    width: '100%',
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
});
