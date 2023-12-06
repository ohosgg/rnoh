import React, {useState} from 'react';
import {Animated, View, Button, StyleSheet, Text} from 'react-native';

export function AnimatedRenderExample() {
  const translateXYalue = React.useRef(
    new Animated.ValueXY({x: 0, y: 0}),
  ).current;
  const [num, setNum] = useState(0);
  const [animated, setAnimated] = useState(true);

  const onPress = React.useRef(
    Animated.loop(
      Animated.timing(translateXYalue, {
        toValue: {x: 100, y: 100},
        useNativeDriver: true,
      }),
    ),
  ).current;

  React.useEffect(() => {
    const id = translateXYalue.addListener(() => {
      setNum(n => n + 1);
    });
    return () => {
      translateXYalue.removeListener(id);
    };
  }, []);

  return (
    <View style={[styles.mainBlock]}>
      <Animated.View
        style={[
          styles.viewBlock,
          {marginBottom: 100},
          animated
            ? {transform: translateXYalue.getTranslateTransform()}
            : {transform: [{translateX: 50}, {translateY: 50}]},
        ]}
      />
      <Text>{num}</Text>
      <Button
        onPress={() => {
          onPress.reset();
          onPress.start();
        }}
        title="Start"
      />
      <Button onPress={() => onPress.stop()} title="Stop" />
      <Button onPress={() => onPress.reset()} title="Reset" />
      {/* NOTE: this is bugged on (Fabric) iOS and Harmony, but fine on Android */}
      <Button
        disabled
        onPress={() => setAnimated(!animated)}
        title={`Toggle animated (${animated})`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainBlock: {
    padding: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  viewBlock: {
    padding: 20,
    width: 100,
    height: 100,
    backgroundColor: '#ffff00',
  },
});
