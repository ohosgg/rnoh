import {TestCase, TestSuite} from '@rnoh/testerino';
import {useRef} from 'react';
import {Animated, Text, TouchableOpacity, View, ViewStyle} from 'react-native';
import {Button} from '../components';
import React from 'react';

export function TouchHandlingTest() {
  return (
    <TestSuite name="Touch Handling">
      <TestCase
        itShould="register a touch after native transform animation"
        initialState={false}
        arrange={({setState}) => (
          <RectangleSlider
            onPress={() => {
              setState(prev => !prev);
            }}
          />
        )}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
      <TestCase
        itShould="handle press on rotated view"
        initialState={false}
        arrange={({setState}) => (
          <TouchableTransformedTest
            setState={setState}
            transform={[{rotate: '180deg'}, {translateX: 100}]}
          />
        )}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
      <TestCase
        itShould="handle press on scaled view"
        initialState={false}
        arrange={({setState}) => (
          <TouchableTransformedTest
            setState={setState}
            transform={[{scaleX: -1}, {translateX: 100}]}
          />
        )}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
      <TestCase itShould="report transformed touch coordinates">
        <TouchCoordinatesTest
          transform={[
            {rotate: '45deg'},
            {translateY: 50},
            {translateX: -50},
            {scaleY: -1},
            {scale: 0.75},
          ]}
        />
      </TestCase>
      <TestCase itShould="report transformed touch coordinates">
        <TouchCoordinatesTest
          transform={[
            {rotate: '-45deg'},
            {translateY: 50},
            {translateX: -50},
            {scaleX: -1},
            {scaleY: 1.25},
          ]}
        />
      </TestCase>
    </TestSuite>
  );
}

function RectangleSlider(props: {onPress: () => void}) {
  const square1Anim = useRef(new Animated.Value(0)).current;
  const animation = Animated.timing(square1Anim, {
    toValue: 64,
    duration: 1000,
    useNativeDriver: true,
  });
  const handleAnimation = () => {
    animation.reset();
    animation.start();
  };

  return (
    <>
      <Animated.View
        onTouchEnd={() => {
          props.onPress();
        }}
        style={{
          height: 64,
          width: 64,
          backgroundColor: 'red',
          transform: [
            {
              translateX: square1Anim,
            },
          ],
        }}
      />
      <Button label="Animate" onPress={handleAnimation} />
    </>
  );
}

function TouchableTransformedTest({
  setState,
  transform,
}: {
  setState: (v: boolean) => void;
  transform: ViewStyle['transform'];
}) {
  return (
    <View
      style={{
        alignSelf: 'center',
        width: 75,
        backgroundColor: 'red',
        transform,
      }}>
      <TouchableOpacity onPress={() => setState(true)}>
        <Text>Press me!</Text>
      </TouchableOpacity>
    </View>
  );
}

function TouchCoordinatesTest({
  transform,
}: {
  transform?: ViewStyle['transform'];
}) {
  const [position, setPosition] = React.useState({x: 0, y: 0});

  return (
    <View style={{height: 250}}>
      <Text>Touch coordinates: {JSON.stringify(position)}</Text>
      <View
        style={{
          alignSelf: 'center',
          width: 150,
          height: 150,
          backgroundColor: 'red',
          transform,
          opacity: 0.5,
        }}
        onTouchStart={e => {
          setPosition({
            x: Math.round(e.nativeEvent.locationX),
            y: Math.round(e.nativeEvent.locationY),
          });
        }}
        onTouchMove={e => {
          setPosition({
            x: Math.round(e.nativeEvent.locationX),
            y: Math.round(e.nativeEvent.locationY),
          });
        }}>
        <Text>Top left</Text>
      </View>
    </View>
  );
}
