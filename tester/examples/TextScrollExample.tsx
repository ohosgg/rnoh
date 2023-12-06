import React, {useState} from 'react';
import {ScrollView, Text, TextInput, View} from 'react-native';

export function TextScrollExample() {
  const [numberOfComponents, setNumberOfComponents] = useState(100);
  const generateRandomText = (length: number) => {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  };

  const textWidgetsArray = Array.from(
    {length: numberOfComponents},
    (_, index) => (
      <Text key={index} style={{height: 53}}>
        {generateRandomText(100)}
      </Text>
    ),
  );

  return (
    <ScrollView>
      <TextInput
        style={{
          backgroundColor: 'white',
          width: '100%',
          height: 36,
          color: 'black',
        }}
        value={numberOfComponents.toString()}
        onChangeText={value => {
          setNumberOfComponents(parseInt(value) || 0);
        }}
      />
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
        }}>
        {textWidgetsArray}
      </View>
    </ScrollView>
  );
}
