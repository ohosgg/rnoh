import React, {useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  UIManager,
  findNodeHandle,
} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';
import {Effect, Ref, Button} from '../components';

export function UIManagerTest() {
  return (
    <TestSuite name="UIManager.measure">
      <TestCase
        itShould="not round text measurement to integers"
        initialState={{
          view: {width: 0, height: 0},
          text: {width: 0, height: 0},
        }}
        arrange={({setState, state}) => {
          return (
            <Ref<View>
              render={refView => {
                return (
                  <Ref<Text>
                    render={refText => {
                      return (
                        <Effect
                          onMount={() => {
                            setTimeout(() => {
                              refText.current?.measure(
                                (x, y, width, height, left, top) => {
                                  setState(prev => ({
                                    ...prev,
                                    text: {width, height},
                                  }));
                                },
                              );
                              refView.current?.measure(
                                (x, y, width, height, left, top) => {
                                  setState(prev => ({
                                    ...prev,
                                    view: {width, height},
                                  }));
                                },
                              );
                            }, 1000);
                          }}>
                          <Text
                            ref={refText}
                            style={{
                              width: 256.5,
                              height: 64.5,
                              color: '#fff',
                              borderColor: '#FF8041',
                              textAlign: 'center',
                              textAlignVertical: 'center',
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor: '#7700FF',
                            }}>
                            <View
                              ref={refView}
                              style={{
                                backgroundColor: 'red',
                                width: 16.5,
                                height: 16.5,
                              }}
                            />
                            {'Measure me'}
                          </Text>
                        </Effect>
                      );
                    }}
                  />
                );
              }}
            />
          );
        }}
        assert={({expect, state}) => {
          expect(state.view.width).to.be.closeTo(16.5, 0.4);
          expect(state.view.width).not.to.be.eq(16);
          expect(state.view.width).not.to.be.eq(17);
          expect(state.text.width).to.be.closeTo(256.5, 0.4);
          expect(state.text.width).not.to.be.eq(256);
          expect(state.text.width).not.to.be.eq(257);
          expect(state.text.height).to.be.closeTo(64.5, 0.4);
          expect(state.text.height).not.to.be.eq(65);
          expect(state.text.height).not.to.be.eq(64);
        }}
      />
      <TestCase itShould="scroll down on press">
        <DispatchCommandTest />
      </TestCase>
      <TestCase
        itShould="return view manager config"
        fn={({expect}) => {
          expect(UIManager.getViewManagerConfig('RCTView')).to.be.an('object');
        }}
      />
      <TestCase
        itShould="not return view manager config for non-existing view"
        fn={({expect}) => {
          expect(UIManager.getViewManagerConfig('RCTNotAView')).to.be.null;
        }}
      />
      <TestCase
        itShould="check if view manager config exists"
        fn={({expect}) => {
          expect(UIManager.hasViewManagerConfig('RCTView')).to.be.true;
          expect(UIManager.hasViewManagerConfig('RCTNotAView')).to.be.false;
        }}
      />
    </TestSuite>
  );
}

function DispatchCommandTest() {
  const ref = useRef<ScrollView>(null);

  return (
    <View>
      <ScrollView ref={ref} style={{height: 100}}>
        <View style={[styles.box, {backgroundColor: 'red'}]} />
        <View style={[styles.box, {backgroundColor: 'blue'}]} />
      </ScrollView>
      <Button
        label="scroll to bottom"
        onPress={() => {
          UIManager.dispatchViewManagerCommand(
            findNodeHandle(ref.current),
            'scrollToEnd',
            [true],
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 20,
    backgroundColor: 'red',
  },
  box: {
    height: 100,
    width: 50,
  },
  text: {
    height: 60,
  },
});
