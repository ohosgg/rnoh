import React from 'react';
import {Animated, Text} from 'react-native';

export function AnimationsExample() {
  const animWidth = React.useRef(new Animated.Value(100)).current;

  const animation = React.useMemo(() => {
    const expand = Animated.timing(animWidth, {
      toValue: 300,
      duration: 1000,
      useNativeDriver: false,
    });
    const contract = Animated.timing(animWidth, {
      toValue: 100,
      duration: 1000,
      useNativeDriver: false,
    });
    return Animated.sequence([expand, contract]);
  }, []);

  return (
    <Animated.View
      style={{
        height: 100,
        width: animWidth,
        backgroundColor: 'red',
      }}
      onTouchEnd={() => {
        animation.reset();
        animation.start();
      }}>
      <Text style={{width: 100, height: 24}}>Press me</Text>
    </Animated.View>
  );
}
