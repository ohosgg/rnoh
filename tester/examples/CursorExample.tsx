import React, {useRef, useEffect} from 'react';
import {View, PanResponder, Animated, Text, ScrollView} from 'react-native';

export function CursorExample() {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}]),
      onPanResponderRelease: () => {
        Animated.timing(pan, {
          toValue: {x: 0, y: 0},
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  useEffect(() => {
    pan.setOffset({x: 0, y: 0});
    pan.setValue({x: 0, y: 0});
  }, []);

  return (
    <View style={{flex: 1}}>
      <ScrollView style={{height: 600}}>
        <View style={{height: 500, width: '100%', backgroundColor: 'silver'}} />
        <View style={{height: 500, width: '100%', backgroundColor: 'gray'}} />
      </ScrollView>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          {transform: pan.getTranslateTransform()},
          {width: 50, height: 50, backgroundColor: 'red', position: 'absolute'},
        ]}>
        <Text style={{width: '100%', height: '100%'}}>Drag me around</Text>
      </Animated.View>
    </View>
  );
}
