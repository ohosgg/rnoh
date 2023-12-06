import React, {useState} from 'react';
import {ScrollView, TextInput, View} from 'react-native';
import {Button} from '../components';

export function ManyComponentsExample() {
  const [numberOfComponents, setNumberOfComponents] = useState(100);
  const [shouldShowComponents, setShouldShowComponents] = useState(true);

  return (
    <ScrollView contentContainerStyle={{height: 1000}}>
      <View style={{flexDirection: 'row'}}>
        <Button
          label={shouldShowComponents ? 'Hide components' : 'Show components'}
          onPress={() => {
            setShouldShowComponents(prev => !prev);
          }}
        />
      </View>
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
      {shouldShowComponents && (
        <View style={{width: '100%', height: 600}}>
          {new Array(numberOfComponents).fill(0).map((_, idx) => {
            return (
              <View
                key={idx}
                style={{
                  position: 'absolute',
                  top: Math.random() * 500,
                  left: Math.random() * 300,
                  width: 25,
                  height: 25,
                  backgroundColor: Math.random() < 0.5 ? 'green' : 'blue',
                }}
              />
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
