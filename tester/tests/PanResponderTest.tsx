import {
  Animated,
  PanResponder,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';
import {useRef} from 'react';

export const PanResponderTest = () => {
  return (
    <TestSuite name="PanResponder">
      <TestCase
        itShould="create PanResponder"
        fn={({expect}) => {
          expect(PanResponder.create({})).to.be.not.empty;
        }}
      />
      <TestCase itShould="allow panning inside ScrollView">
        <PanResponderInScrollView />
      </TestCase>
    </TestSuite>
  );
};

const PanResponderInScrollView = () => {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, {dx: pan.x, dy: pan.y}],
        undefined,
      ),
      onPanResponderRelease: () => {
        pan.extractOffset();
      },
      onShouldBlockNativeResponder: () => true,
    }),
  ).current;
  return (
    <ScrollView style={styles.scrollview} horizontal pagingEnabled>
      <View style={[styles.base, styles.view1]}>
        <Animated.View
          style={{
            transform: [{translateX: pan.x}, {translateY: pan.y}],
          }}
          {...panResponder.panHandlers}>
          <View style={styles.box} />
        </Animated.View>
      </View>
      <View style={[styles.base, styles.view2]} />
      <View style={[styles.base, styles.view1]} />
      <View style={[styles.base, styles.view2]} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  view1: {
    backgroundColor: 'pink',
  },
  view2: {
    backgroundColor: 'powderblue',
  },
  base: {
    height: 400,
    width: 300,
  },
  scrollview: {
    borderWidth: 2,
    borderColor: 'black',
    height: 400,
    width: 300,
  },
  box: {
    height: 100,
    width: 100,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
});
