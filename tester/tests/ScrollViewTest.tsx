import {View, ScrollView} from 'react-native';
import {TestSuite, TestCase} from '@rnoh/testerino';
import React from 'react';

export function ScrollViewTest() {
  return (
    <TestSuite name="ScrollView">
      <TestCase itShould="render scroll view with different rounded corners">
        <View
          style={{
            width: '100%',
            height: 100,
            position: 'relative',
            overflow: 'hidden',
          }}>
          <ScrollView
            style={{
              width: '80%',
              height: '80%',
              borderWidth: 3,
              borderColor: 'firebrick',
              borderTopLeftRadius: 10,
              borderTopRightRadius: 20,
              borderBottomRightRadius: 30,
              borderBottomLeftRadius: 40,
              backgroundColor: 'beige',
            }}
            contentContainerStyle={{
              alignItems: 'center',
              justifyContent: 'center',
            }}
            scrollEventThrottle={16}>
            {new Array(3).fill(0).map((_, idx) => {
              return (
                <View
                  key={idx}
                  style={{
                    width: '100%',
                    height: 50,
                    backgroundColor: 'pink',
                    marginBottom: 50,
                  }}
                />
              );
            })}
          </ScrollView>
        </View>
      </TestCase>
    </TestSuite>
  );
}
