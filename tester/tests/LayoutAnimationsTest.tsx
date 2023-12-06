import {
  LayoutAnimation,
  View,
  Platform,
  UIManager,
  StyleSheet,
} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';
import {useState} from 'react';
import {Button} from '../components';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function LayoutAnimationsTest() {
  return (
    <TestSuite name="LayoutAnimations">
      <TestCase itShould="fade in orange rect, move it to right, then left, and fade it out">
        <LayoutAnimationExample />
      </TestCase>
    </TestSuite>
  );
}

function LayoutAnimationExample() {
  const [boxPosition, setBoxPosition] = useState('left');
  const [isRectVisible, setVisible] = useState(false);

  return (
    <View
      style={{
        height: 64,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        flexDirection: 'row',
      }}>
      {!isRectVisible && (
        <Button
          label={'Run layout animation'}
          onPress={() => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            setVisible(true);

            setTimeout(() => {
              LayoutAnimation.configureNext({
                duration: 500,
                update: {type: 'spring'},
              });
              setBoxPosition('right');
              setTimeout(() => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut,
                );
                setBoxPosition('left');
              }, 500);

              setTimeout(() => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut,
                );
                setVisible(false);
              }, 1000);
            }, 500);
          }}
        />
      )}
      {isRectVisible && (
        <View
          style={StyleSheet.flatten([
            {
              width: 64,
              height: 64,
              top: 0,
              left: 0,
              opacity: 1,
              backgroundColor: 'orange',
              position: 'absolute',
            },
            boxPosition === 'left' ? null : {left: 200},
          ])}
        />
      )}
    </View>
  );
}
