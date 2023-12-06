import React, {useState} from 'react';
import {Animated, Text, View} from 'react-native';

const N_ROWS = 100;
const N_COLS = 100;
const SIZE = 3;

export function CheckerboardExample() {
  const [isCheckerboardVisible, setIsCheckerboardVisible] = useState(false);

  return (
    <View style={{backgroundColor: 'black', width: '100%', height: '100%'}}>
      <AnimatedRectangle />
      <Button
        label="Show checkerboard"
        onPress={() => setIsCheckerboardVisible(prev => !prev)}
      />

      {isCheckerboardVisible &&
        new Array(N_ROWS).fill(0).map((_, rowId) => {
          return (
            <View key={rowId} style={{flexDirection: 'row', width: '100%'}}>
              {new Array(N_COLS).fill(0).map((__, colId) => {
                return <Box key={colId} colorId={(rowId + colId) % 3} />;
              })}
            </View>
          );
        })}
    </View>
  );
}

function Button({onPress}: {label: string; onPress: () => void}) {
  return (
    <View
      onTouchEnd={onPress}
      style={{backgroundColor: 'blue', width: 192, height: 24}}>
      <Text style={{width: '100%', height: '100%', color: 'white'}}>
        Show checkerboard
      </Text>
    </View>
  );
}

function Box({colorId}: {colorId: number}) {
  function getColor() {
    if (colorId === 1) {
      return '#0F0';
    }
    if (colorId === 2) {
      return '#00F';
    }
    return '#F00';
  }
  return (
    <View style={{width: SIZE, height: SIZE, backgroundColor: getColor()}} />
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
