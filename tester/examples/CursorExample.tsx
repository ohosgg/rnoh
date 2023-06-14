import React, {useRef, useEffect} from 'react';
import {View, PanResponder, Animated, Text} from 'react-native';

export function CursorExample() {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        Animated.spring(pan, {
          toValue: {x: 0, y: 0},
          useNativeDriver: false,
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
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          pan.getLayout(),
          {width: 50, height: 50, backgroundColor: 'red'},
        ]}>
        <Text style={{width: '100%', height: '100%'}}>Drag me around</Text>
      </Animated.View>
    </View>
  );
}
