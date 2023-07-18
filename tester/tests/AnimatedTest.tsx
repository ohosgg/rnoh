import React from 'react';

import {Animated, Pressable, Text, View} from 'react-native';

import {TestCase, TestSuite} from '@rnoh/testerino';

export function AnimatedTest() {
  return (
    <TestSuite name="Animated">
      <TestCase itShould="animate width">
        <AnimatedRectangle />
      </TestCase>
      <TestCase itShould="move red square horizontally relatively to the scroll offset">
        <AnimatedScrollViewTestCase />
      </TestCase>
      <TestCase itShould="fade in and out when clicked">
        <FadeInOut />
        <FadeInOut nativeDriver/>
      </TestCase>
    </TestSuite>
  );
}

function AnimatedRectangle() {
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
      }}
    />
  );
}

const AnimatedScrollViewTestCase = () => {
  const scrollY = new Animated.Value(0);
  const translation = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 200],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={{
        width: '100%',
        height: 100,
        position: 'relative',
        overflow: 'hidden',
      }}>
      <Animated.ScrollView
        style={{width: '100%', height: '100%'}}
        contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {
            useNativeDriver: true,
          },
        )}>
        {new Array(3).fill(0).map((_, idx) => {
          return (
            <View
              key={idx}
              style={{
                width: '100%',
                height: 50,
                backgroundColor: 'gray',
                marginBottom: 50,
              }}
            />
          );
        })}
      </Animated.ScrollView>
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            transform: [{translateX: translation}],
            width: 32,
            height: 32,
            backgroundColor: 'red',
          },
        ]}
      />
    </View>
  );
};

function FadeInOut({nativeDriver = false}) {
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const handleFadePress = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: nativeDriver,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: nativeDriver,
      }),
    ]).start();
  };

  return (
    <Pressable onPress={handleFadePress}>
      <Animated.View
        style={{
          marginTop: 24,
          height: 100,
          width: 100,
          opacity: fadeAnim,
          backgroundColor: 'red',
        }}>
        <Text style={{width: 100, height: 48}}>Press me to fade{nativeDriver && " using native driver"}</Text>
      </Animated.View>
    </Pressable>
  );
}
