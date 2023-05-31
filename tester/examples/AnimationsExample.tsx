import React, {useEffect, useState} from 'react';
import {
  Animated,
  ScrollView,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';

export function AnimationsExample() {
  const [isIntervalRunning, setIsIntervalRunning] = useState(false);
  const [isTogglingComponent, setIsTogglingComponent] = useState(false);
  const [isComponentVisible, setIsComponentVisible] = useState(false);
  const animWidth = React.useRef(new Animated.Value(100)).current;
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const handleFadePress = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  };
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

  useEffect(() => {
    const timerId = isIntervalRunning
      ? setInterval(() => {
          setTimeout(() => {}, 1);
        }, 1)
      : undefined;
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isIntervalRunning]);

  useEffect(() => {
    let timerId: any;
    if (isTogglingComponent)
      timerId = setInterval(() => {
        setIsComponentVisible(prev => !prev);
      }, 1000);
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [isTogglingComponent]);

  return (
    <ScrollView contentContainerStyle={{height: 2000}}>
      <TouchableOpacity
        onPress={() => {
          setIsIntervalRunning(prev => !prev);
        }}>
        <Text style={{width: '100%', height: 32}}>
          {isIntervalRunning ? 'Stop running interval' : 'Run interval'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          setIsTogglingComponent(prev => !prev);
        }}>
        <Text style={{width: '100%', height: 32}}>
          {isTogglingComponent
            ? 'Stop toggling component'
            : 'Start toggling component'}
        </Text>
      </TouchableOpacity>

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
      <Animated.View
        style={{
          marginTop: 24,
          height: 100,
          width: 100,
          opacity: fadeAnim,
          backgroundColor: 'red',
        }}
        onTouchEnd={handleFadePress}>
        <Text style={{width: 100, height: 48}}>Press me to fade</Text>
      </Animated.View>

      {isComponentVisible && (
        <View style={{width: 100, height: 100, backgroundColor: 'blue'}} />
      )}
    </ScrollView>
  );
}
