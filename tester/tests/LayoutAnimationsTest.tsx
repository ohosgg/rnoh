import {
  LayoutAnimation,
  Pressable,
  View,
  Platform,
  UIManager,
} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';
import {useState} from 'react';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function LayoutAnimationsTest() {
  return (
    <TestSuite name="LayoutAnimations">
      <TestCase itShould="[FAILS] animate red rect after pressing the blue one">
        <LayoutAnimationExample />
      </TestCase>
    </TestSuite>
  );
}

function LayoutAnimationExample() {
  const [boxPosition, setBoxPosition] = useState('left');

  const toggleBox = () => {
    LayoutAnimation.configureNext({
      duration: 2000,
      create: {type: 'linear', property: 'opacity'},
      update: {type: 'spring', springDamping: 1},
      delete: {type: 'linear', property: 'opacity'},
    });
    setBoxPosition(boxPosition === 'left' ? 'right' : 'left');
  };

  return (
    <View style={{height: 64}}>
      <Pressable onPress={toggleBox}>
        <View style={{width: 64, height: 64, backgroundColor: 'blue'}} />
      </Pressable>
      <View
        style={[
          {
            width: 64,
            height: 64,
            position: 'absolute',
            left: 64,
            backgroundColor: 'red',
          },
          boxPosition === 'left' ? null : {left: 200},
        ]}
      />
    </View>
  );
}
