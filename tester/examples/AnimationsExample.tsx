import React, {useEffect, useState} from 'react';
import {Animated, ScrollView, Text, TextInput, View} from 'react-native';
import {Button} from '../components';

export function AnimationsExample() {
  const [isIntervalRunning, setIsIntervalRunning] = useState(false);
  const [isTogglingComponent, setIsTogglingComponent] = useState(false);
  const [isComponentVisible, setIsComponentVisible] = useState(false);
  const xAnim = React.useRef(new Animated.Value(0)).current;
  const xAnimNative = React.useRef(new Animated.Value(0)).current;
  const yAnimNative = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const [numberOfComponents, setNumberOfComponents] = useState(100);

  useEffect(() => {
    const timerId = isIntervalRunning
      ? setInterval(() => {
          setTimeout(() => {}, 1);
        }, 1)
      : undefined;
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [isIntervalRunning]);

  useEffect(() => {
    let timerId: any;
    if (isTogglingComponent) {
      timerId = setInterval(() => {
        setIsComponentVisible(prev => !prev);
      }, 1000);
    }
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [isTogglingComponent]);

  useEffect(() => {
    const x = Animated.loop(
      Animated.sequence([
        Animated.timing(xAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(xAnim, {
          toValue: 100,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(xAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
    );
    x.start();

    const xNative = Animated.loop(
      Animated.sequence([
        Animated.timing(xAnimNative, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(xAnimNative, {
          toValue: 100,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(xAnimNative, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    xNative.start();

    const yNative = Animated.loop(
      Animated.sequence([
        Animated.timing(yAnimNative, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(yAnimNative, {
          toValue: 2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(yAnimNative, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    yNative.start();

    const fade = Animated.loop(
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
      ]),
    );
    fade.start();

    return () => {
      x.stop();
      xNative.stop();
      fade.stop();
    };
  }, []);

  const spin = xAnimNative.interpolate({
    inputRange: [0, 100],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <ScrollView>
      <View style={{flexDirection: 'row'}}>
        <Button
          label={isIntervalRunning ? 'Stop running interval' : 'Run interval'}
          onPress={() => {
            setIsIntervalRunning(prev => !prev);
          }}
        />
        <Button
          label={
            isTogglingComponent
              ? 'Stop toggling component'
              : 'Start toggling component'
          }
          onPress={() => {
            setIsTogglingComponent(prev => !prev);
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
      <View style={{width: '100%'}}>
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
        <Animated.View
          style={{
            height: 100,
            width: 100,
            opacity: fadeAnim,
            backgroundColor: 'red',
          }}
        />
        <Animated.View
          style={{
            height: 100,
            width: 100,
            left: xAnim,
            backgroundColor: 'red',
          }}>
          <Text style={{height: 24}}>Position</Text>
        </Animated.View>
        <>
          <Animated.View
            style={{
              height: 100,
              width: 100,
              transform: [{translateX: xAnim}],
              backgroundColor: 'red',
            }}>
            <Text style={{height: 24}}>Transform</Text>
          </Animated.View>
          <Animated.View
            style={{
              height: 100,
              width: 100,
              transform: [{translateX: xAnimNative}],
              backgroundColor: 'red',
            }}>
            <Text style={{height: 24}}>Native driver</Text>
          </Animated.View>
          <Animated.View
            style={{
              height: 100,
              width: 100,
              transform: [{translateX: Animated.add(xAnimNative, 50)}],
              backgroundColor: 'red',
            }}>
            <Text style={{height: 48}}>Native driver Addition</Text>
          </Animated.View>
          <Animated.View
            style={{
              height: 100,
              width: 100,
              transform: [
                {translateX: Animated.multiply(xAnimNative, yAnimNative)},
              ],
              backgroundColor: 'red',
            }}>
            <Text style={{height: 48}}>Native driver Multiplication</Text>
          </Animated.View>
          <Animated.View
            style={{
              height: 100,
              width: 100,
              transform: [
                {
                  translateX: Animated.divide(
                    xAnimNative,
                    Animated.add(yAnimNative, 1),
                  ),
                },
              ],
              backgroundColor: 'red',
            }}>
            <Text style={{height: 48}}>Native driver Division</Text>
          </Animated.View>
          <Animated.View
            style={{
              height: 100,
              width: 100,
              transform: [{translateX: Animated.subtract(xAnimNative, 50)}],
              backgroundColor: 'red',
            }}>
            <Text style={{height: 48}}>Native driver Subtraction</Text>
          </Animated.View>
          <Animated.View
            style={{
              height: 100,
              width: 100,
              transform: [
                {scaleX: Animated.add(Animated.divide(xAnimNative, 100), 0.5)},
              ],
              backgroundColor: 'red',
            }}>
            <Text style={{height: 48}}>Native driver scale</Text>
          </Animated.View>
          <Animated.View
            style={{
              height: 100,
              width: 100,
              transform: [{rotate: spin}],
              backgroundColor: 'red',
            }}>
            <Text style={{height: 48}}>Native driver rotate</Text>
          </Animated.View>
          <Animated.View
            style={{
              height: 100,
              width: 100,
              transform: [{rotateX: spin}, {rotateY: spin}],
              backgroundColor: 'red',
            }}>
            <Text style={{height: 48}}>Native driver rotate X&Y</Text>
          </Animated.View>
        </>
        {isComponentVisible && (
          <View
            style={{
              width: 100,
              height: 100,
              backgroundColor: 'blue',
              position: 'absolute',
              right: 0,
            }}
          />
        )}
      </View>
    </ScrollView>
  );
}
