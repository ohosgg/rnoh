import {TestCase, TestSuite} from '@rnoh/testerino';
import {useRef} from 'react';
import {Animated} from 'react-native';
import {Button} from '../components';

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
