import { Text, View } from 'react-native';
import { TestSuite, TestCase } from '@rnoh/testerino';
import React, { useState } from 'react';
import { Button } from '../components';

export function ViewTest() {
  return (
    <TestSuite name="View">
      <TestCase itShould="render square with transparent background on gray background">
        <View style={{ width: '100%', height: 100, backgroundColor: 'gray' }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderWidth: 3,
              borderColor: 'white',
            }}
          />
        </View>
      </TestCase>
      <TestCase itShould="render square with rounded corners with different radii (left/right)">
        <View style={{ width: '100%', height: 100, backgroundColor: 'gray' }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderWidth: 3,
              borderColor: 'white',
              borderTopLeftRadius: 10,
              borderTopRightRadius: 20,
              borderBottomRightRadius: 30,
              borderBottomLeftRadius: 40,
            }}
          />
        </View>
      </TestCase>
      <TestCase itShould="render square with rounded corners with different radii (start/end)">
        <View style={{ width: '100%', height: 100, backgroundColor: 'gray' }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderWidth: 3,
              borderColor: 'white',
              borderTopStartRadius: 10,
              borderTopEndRadius: 20,
              borderBottomEndRadius: 30,
              borderBottomStartRadius: 40,
            }}
          />
        </View>
      </TestCase>
      <TestCase itShould="render square with borders with different widths">
        <View style={{width: '100%', height: 100, backgroundColor: 'gray'}}>
          <View
            style={{
              width: 100,
              height: 100,
              borderColor: 'white',
              borderLeftWidth: 2,
              borderTopWidth: 4,
              borderRightWidth: 6,
              borderBottomWidth: 8,
            }}
          />
        </View>
      </TestCase>
      <TestCase itShould="render square with borders with different colors">
        <View style={{ width: '100%', height: 100, backgroundColor: 'gray' }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderWidth: 3,
              borderLeftColor: 'blue',
              borderTopColor: 'red',
              borderRightColor: 'green',
              borderBottomColor: 'yellow',
            }}
          />
        </View>
      </TestCase>
      <TestCase itShould="render square with borders with different start/end colors">
        <View style={{ width: '100%', height: 100, backgroundColor: 'gray' }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderWidth: 3,
              borderStartColor: 'blue',
              borderEndColor: 'green',
            }}
          />
        </View>
      </TestCase>
      <TestCase itShould="render squares with borders with different style">
        <View
          style={{
            width: '100%',
            height: 100,
            backgroundColor: 'gray',
            flexDirection: 'row',
          }}>
          <View
            style={{
              width: 100,
              height: 100,
              marginEnd: 4,
              borderWidth: 3,
              borderColor: 'white',
              borderStyle: 'solid',
            }}
          />
          <View
            style={{
              width: 100,
              height: 100,
              marginEnd: 4,
              borderWidth: 3,
              borderColor: 'white',
              borderStyle: 'dotted',
            }}
          />
          <View
            style={{
              width: 100,
              height: 100,
              borderWidth: 3,
              borderColor: 'white',
              borderStyle: 'dashed',
            }}
          />
        </View>
      </TestCase>
      <TestCase itShould="hide the overflow">
        <View
          style={{
            width: 64,
            height: 64,
            backgroundColor: 'red',
            overflow: 'hidden'
          }}
          collapsable={false}>
          <View
            style={{
              width: 64,
              height: 64,
              backgroundColor: 'green',
              marginLeft: 32,
            }}
          />
        </View>
      </TestCase>
      <TestCase itShould="not hide the overflow">
        <View
          style={{
            width: 64,
            height: 64,
            backgroundColor: 'red',
          }}
          collapsable={false}>
          <View
            style={{
              width: 64,
              height: 64,
              backgroundColor: 'green',
              marginLeft: 32,
            }}
          />
        </View>
      </TestCase>
      <TestCase itShould="render blue rectangle (zIndex test)">
        <View>
          <View
            style={{
              width: 64,
              height: 64,
              backgroundColor: 'blue',
              zIndex: 2,
              position: 'relative', // https://github.com/facebook/react-native/issues/38513
            }}
          />
          <View
            style={{
              width: 64,
              height: 64,
              backgroundColor: 'red',
              zIndex: 1,
              position: 'absolute',
            }}
          />
        </View>
      </TestCase>
      <TestCase
        itShould="render square with elevation"
        skip
      //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/238
      >
        <View style={{ width: '100%', height: 100 }}>
          <View
            style={{
              width: 80,
              height: 80,
              margin: 10,
              backgroundColor: 'blue',
              elevation: 10,
            }}
          />
        </View>
      </TestCase>
      <TestCase
        skip
        itShould="show inner rectangle with the same color as the reference (needsOffscreenAlphaCompositing)"
      //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/322
      >
        <View
          style={{
            opacity: 0.5,
            backgroundColor: 'red',
            height: 100,
            width: 100,
          }}
          needsOffscreenAlphaCompositing>
          <View
            style={{ backgroundColor: 'black', width: 60, height: 40, opacity: 0.5 }}
          />
        </View>
        <Text style={{ height: 20 }}>
          Reference black color with opacity: 0.5
        </Text>
        <View style={{ width: 60, height: 40, backgroundColor: 'black', opacity: 0.5 }} />
      </TestCase>
      <TestSuite name="pointerEvents">
        <TestCase
          itShould="call inner and outer view when pressing inner"
          initialState={{ inner: false, outer: false, outerContainer: false }}
          arrange={({ setState, reset }) => {
            return (
              <PointerEventsView
                pointerEventsOuter="auto"
                setState={setState}
                reset={reset}
              />
            );
          }}
          assert={({ expect, state }) => {
            expect(state).to.be.deep.eq({
              inner: true,
              outer: true,
              outerContainer: true,
            });
          }}
        />
        <TestCase
          itShould="call only outer when pressing inner view"
          initialState={{ inner: false, outer: false, outerContainer: true }}
          arrange={({ setState, reset }) => {
            return (
              <PointerEventsView
                pointerEventsOuter="box-only"
                setState={setState}
                reset={reset}
              />
            );
          }}
          assert={({ expect, state }) => {
            expect(state).to.be.deep.eq({
              inner: false,
              outer: true,
              outerContainer: true,
            });
          }}
        />
        <TestCase
          itShould="call inner and outer only when pressing inner view"
          initialState={{ inner: false, outer: false, outerContainer: false }}
          arrange={({ setState, reset }) => {
            return (
              <PointerEventsView
                disableOuterContainerTouch
                pointerEventsOuter="box-none"
                setState={setState}
                reset={reset}
              />
            );
          }}
          assert={({ expect, state }) => {
            expect(state.inner).to.be.true;
            expect(state.outer).to.be.true;
          }}
        />
        <TestCase
          itShould="not call inner or outer when pressing inner or outer views"
          initialState={{ inner: false, outer: false, outerContainer: false }}
          arrange={({ setState, reset }) => {
            return (
              <PointerEventsView
                pointerEventsOuter="none"
                setState={setState}
                reset={reset}
              />
            );
          }}
          assert={({ expect, state }) => {
            expect(state).to.be.deep.eq({
              inner: false,
              outer: false,
              outerContainer: true,
            });
          }}
        />
      </TestSuite>
      <TestCase
        itShould="render view focusable with a non-touch input device"
        skip
      //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/258
      >
        <View style={{ width: '100%', height: 100 }}>
          <View
            style={{
              width: 100,
              height: 100,
              backgroundColor: 'blue',
            }}
            // @ts-ignore
            tabIndex={0}
            skip
          />
        </View>
      </TestCase>
      <TestCase itShould="render view not focusable with a non-touch input device">
        <View style={{ width: '100%', height: 100 }}>
          <View
            style={{
              width: 100,
              height: 100,
              backgroundColor: 'blue',
            }}
            // @ts-ignore
            tabIndex={-1}
          />
        </View>
      </TestCase>
      <TestCase itShould="render view with fixed width and aspectRatio 1">
        <View style={{ width: '100%', height: 100 }}>
          <View
            style={{
              width: 100,
              backgroundColor: 'blue',
              aspectRatio: 1,
            }}
          />
        </View>
      </TestCase>
      <TestCase itShould="render views with set flex and aspectRatio 1">
        <View style={{ width: '100%', height: 100 }}>
          <View
            style={{
              width: 100,
              backgroundColor: 'blue',
              flex: 1,
              aspectRatio: 1,
            }}
          />
          <View
            style={{
              width: 100,
              backgroundColor: 'blue',
              flex: 2,
              aspectRatio: 1,
            }}
          />
        </View>
      </TestCase>
      <TestCase itShould="show view rotated by 180deg(backfaceVisibility: visible)">
        <View style={{ width: '100%', height: 20 }}>
          <View
            style={{
              width: 100,
              backgroundColor: 'blue',
              transform: [{ rotateY: '180deg' }],
              backfaceVisibility: 'visible',
            }}>
            <Text style={{ height: 20 }}>Backface</Text>
          </View>
        </View>
      </TestCase>
      <TestCase
        itShould="not show view rotated by 180deg(backfaceVisibility: hidden)"
        skip
      //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/259
      >
        <View style={{ width: '100%', height: 20 }}>
          <View
            style={{
              width: 100,
              backgroundColor: 'blue',
              transform: [{ rotateY: '180deg' }],
              backfaceVisibility: 'hidden',
            }}>
            <Text style={{ height: 20 }}>Backface</Text>
          </View>
        </View>
      </TestCase>
      <TestCase itShould="render light blue shadow shifted towards bottom and right">
        <View
          style={{
            width: 64,
            height: 64,
            margin: 8,
            backgroundColor: 'green',
            shadowColor: 'blue',
            shadowOffset: { width: 16, height: 16 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
          }}
        />
      </TestCase>
    </TestSuite>
  );
}

function PointerEventsView(props: {
  disableOuterContainerTouch?: boolean;
  pointerEventsOuter?: 'box-none' | 'none' | 'box-only' | 'auto';
  pointerEventsInner?: 'box-none' | 'none' | 'box-only' | 'auto';
  setState: React.Dispatch<
    React.SetStateAction<{
      inner: boolean;
      outer: boolean;
      outerContainer: boolean;
    }>
  >;
  reset: () => void;
}) {
  return (
    <View style={{ height: 100, width: '100%', flexDirection: 'row' }}>
      <View
        style={{ backgroundColor: 'green' }}
        onTouchEnd={
          props.disableOuterContainerTouch
            ? undefined
            : () => {
              props.setState(prev => ({ ...prev, outerContainer: true }));
            }
        }>
        <View
          style={{ height: 100, width: 100, backgroundColor: 'red' }}
          pointerEvents={props.pointerEventsOuter}
          onTouchEnd={() => {
            props.setState(prev => ({ ...prev, outer: true }));
          }}>
          <View
            style={{
              height: 40,
              width: 40,
              backgroundColor: 'blue',
              margin: 30,
            }}
            onTouchEnd={() => {
              props.setState(prev => ({ ...prev, inner: true }));
            }}
            pointerEvents={props.pointerEventsInner}
          />
        </View>
      </View>
      <Button label="reset" onPress={props.reset} />
    </View>
  );
}
