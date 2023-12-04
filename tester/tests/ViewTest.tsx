import {StyleSheet, Text, View} from 'react-native';
import {TestSuite, TestCase} from '@rnoh/testerino';
import React, {useState} from 'react';
import {Button} from '../components';

export function ViewTest() {
  return (
    <TestSuite name="View">
      <TestCase
        modal
        itShould="log the descriptor on the native side when 'debug' hint is provided">
        <View
          id="__harmony::debug:sampleNativeId"
          style={{width: 64, height: 64, backgroundColor: 'red'}}
        />
      </TestCase>
      <TestCase itShould="render square with transparent background on gray background">
        <View style={{width: '100%', height: 100, backgroundColor: 'gray'}}>
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
        <View style={{width: '100%', height: 100, backgroundColor: 'gray'}}>
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
        <View style={{width: '100%', height: 100, backgroundColor: 'gray'}}>
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
      <TestCase itShould="render squares with borderTopStartRadius and borderTopEndRadius">
        <View style={styles.squaresContainer}>
          <View style={[styles.square, {borderTopStartRadius: 24}]}>
            <Text style={styles.squareContent}>borderTopStartRadius</Text>
          </View>
          <View style={[styles.square, {borderTopEndRadius: 24}]}>
            <Text style={styles.squareContent}>borderTopEndRadius</Text>
          </View>
          <View
            style={[
              styles.square,
              {borderTopEndRadius: 24, borderTopStartRadius: 20},
            ]}>
            <Text style={styles.squareContent}>
              borderTopEndRadius + borderTopStartRadius
            </Text>
          </View>
        </View>
      </TestCase>
      <TestCase itShould="render squares with borderBottomStartRadius + borderBottomEndRadius">
        <View style={styles.squaresContainer}>
          <View style={[styles.square, {borderBottomStartRadius: 24}]}>
            <Text style={styles.squareContent}>borderBottomStartRadius</Text>
          </View>
          <View style={[styles.square, {borderBottomEndRadius: 24}]}>
            <Text style={styles.squareContent}>borderBottomEndRadius</Text>
          </View>
          <View
            style={[
              styles.square,
              {borderBottomEndRadius: 24, borderBottomStartRadius: 24},
            ]}>
            <Text style={styles.squareContent}>
              borderBottomStartRadius + borderBottomEndRadius
            </Text>
          </View>
        </View>
      </TestCase>
      <TestCase itShould="render circles">
        <View style={styles.squaresContainer}>
          <View style={[styles.square, {borderRadius: 50}]} />
          <View
            style={[
              styles.square,
              {
                borderBottomStartRadius: 50,
                borderBottomEndRadius: 50,
                borderTopStartRadius: 50,
                borderTopEndRadius: 50,
              },
            ]}
          />
          <View
            style={[
              styles.square,
              {
                borderBottomLeftRadius: 50,
                borderBottomRightRadius: 50,
                borderTopLeftRadius: 50,
                borderTopRightRadius: 50,
              },
            ]}
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
      <TestCase
        skip
        itShould="render rectangle with borders with different widths and colors">
        <View style={{width: '100%', height: 100, backgroundColor: 'gray'}}>
          <View
            style={{
              height: 80,
              width: 200,
              borderLeftWidth: 1,
              borderTopWidth: 10,
              borderRightWidth: 5,
              borderBottomWidth: 20,
              borderLeftColor: '#ff0000',
              borderRightColor: '#ffff00',
              borderTopColor: 'pink',
              borderBottomColor: 'skyblue',
            }}
          />
        </View>
      </TestCase>
      <TestCase itShould="render square with borders with different colors">
        <View style={{width: '100%', height: 100, backgroundColor: 'gray'}}>
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
        <View style={{width: '100%', height: 100, backgroundColor: 'gray'}}>
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
            overflow: 'hidden',
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
        <View style={{width: '100%', height: 100}}>
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
            style={{
              backgroundColor: 'black',
              width: 60,
              height: 40,
              opacity: 0.5,
            }}
          />
        </View>
        <Text style={{height: 20}}>
          Reference black color with opacity: 0.5
        </Text>
        <View
          style={{
            width: 60,
            height: 40,
            backgroundColor: 'black',
            opacity: 0.5,
          }}
        />
      </TestCase>
      <TestSuite name="pointerEvents">
        <TestCase
          itShould="call inner and outer view when pressing inner"
          initialState={{inner: false, outer: false, outerContainer: false}}
          arrange={({setState, reset}) => {
            return (
              <PointerEventsView
                pointerEventsOuter="auto"
                setState={setState}
                reset={reset}
              />
            );
          }}
          assert={({expect, state}) => {
            expect(state).to.be.deep.eq({
              inner: true,
              outer: true,
              outerContainer: true,
            });
          }}
        />
        <TestCase
          skip // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/424
          itShould="call only outer when pressing inner view"
          initialState={{inner: false, outer: false, outerContainer: true}}
          arrange={({setState, reset}) => {
            return (
              <PointerEventsView
                pointerEventsOuter="box-only"
                setState={setState}
                reset={reset}
              />
            );
          }}
          assert={({expect, state}) => {
            expect(state).to.be.deep.eq({
              inner: false,
              outer: true,
              outerContainer: true,
            });
          }}
        />
        <TestCase
          itShould="call inner and outer only when pressing inner view"
          initialState={{inner: false, outer: false, outerContainer: false}}
          arrange={({setState, reset}) => {
            return (
              <PointerEventsView
                disableOuterContainerTouch
                pointerEventsOuter="box-none"
                setState={setState}
                reset={reset}
              />
            );
          }}
          assert={({expect, state}) => {
            expect(state.inner).to.be.true;
            expect(state.outer).to.be.true;
          }}
        />
        <TestCase
          itShould="not call inner or outer when pressing inner or outer views"
          initialState={{inner: false, outer: false, outerContainer: false}}
          arrange={({setState, reset}) => {
            return (
              <PointerEventsView
                pointerEventsOuter="none"
                setState={setState}
                reset={reset}
              />
            );
          }}
          assert={({expect, state}) => {
            expect(state).to.be.deep.eq({
              inner: false,
              outer: false,
              outerContainer: true,
            });
          }}
        />
      </TestSuite>
      <TestCase
        itShould="pass on touching blue background"
        initialState={false}
        arrange={({setState}) => (
          <View style={{backgroundColor: 'blue', alignSelf: 'center'}}>
            <View
              hitSlop={{top: 48, left: 48, bottom: 48, right: 48}}
              style={{
                width: 48,
                height: 48,
                backgroundColor: 'green',
                margin: 48,
              }}
              onTouchEnd={() => {
                setState(true);
              }}>
              <View
                style={{width: 48, height: 48, backgroundColor: 'red'}}
                onTouchEnd={e => {
                  e.stopPropagation();
                }}
              />
            </View>
          </View>
        )}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
      <TestCase
        itShould="render view focusable with a non-touch input device"
        skip
        //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/258
      >
        <View style={{width: '100%', height: 100}}>
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
        <View style={{width: '100%', height: 100}}>
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
        <View style={{width: '100%', height: 100}}>
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
        <View style={{width: '100%', height: 100}}>
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
        <View style={{width: '100%', height: 20}}>
          <View
            style={{
              width: 100,
              backgroundColor: 'blue',
              transform: [{rotateY: '180deg'}],
              backfaceVisibility: 'visible',
            }}>
            <Text style={{height: 20}}>Backface</Text>
          </View>
        </View>
      </TestCase>
      <TestCase itShould="not show view rotated by 180deg(backfaceVisibility: hidden)">
        <View style={{width: '100%', height: 20}}>
          <View
            style={{
              width: 100,
              backgroundColor: 'blue',
              transform: [{rotateY: '180deg'}],
              backfaceVisibility: 'hidden',
            }}>
            <Text style={{height: 20}}>Backface</Text>
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
            shadowOffset: {width: 16, height: 16},
            shadowOpacity: 0.25,
            shadowRadius: 16,
          }}
        />
      </TestCase>
      <TestCase
        itShould="render a view with role"
        skip // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/603
      >
        <View role="alert">
          <Text>Alert</Text>
        </View>
      </TestCase>
      <TestCase
        skip
        itShould="[FAILS on Android/Harmony] pass on blue rect touch (onResponderReject)"
        initialState={{
          responderRejectedCount: 0,
          responderGrantedCount: 0,
          childResponderGrantedCount: 0,
        }}
        arrange={({setState}) => {
          return (
            <View
              onStartShouldSetResponder={() => true}
              onResponderReject={() => {
                setState(prev => ({
                  ...prev,
                  responderRejectedCount: prev.responderRejectedCount + 1,
                }));
              }}
              onResponderGrant={() => {
                setState(prev => ({
                  ...prev,
                  responderGrantedCount: prev.responderGrantedCount + 1,
                }));
              }}
              style={{
                backgroundColor: 'green',
                padding: 20,
              }}>
              <View
                style={{backgroundColor: 'blue', width: 64, height: 64}}
                onResponderTerminationRequest={() => false}
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => {
                  setState(prev => ({
                    ...prev,
                    childResponderGrantedCount:
                      prev.childResponderGrantedCount + 1,
                  }));
                }}
              />
            </View>
          );
        }}
        assert={({expect, state}) => {
          expect(state.responderRejectedCount).to.be.greaterThan(0);
        }}
      />
      <TestCase
        modal
        itShould='call the "escape" gesture handler'
        initialState={false}
        skip // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/602
        arrange={({setState}) => (
          <View
            accessible={true}
            style={{width: '100%', height: 100, backgroundColor: 'gray'}}
            onAccessibilityEscape={() => {
              console.log('onAccessibilityEscape called!');
              setState(true);
            }}>
            <View
              style={{
                width: 100,
                height: 100,
                backgroundColor: 'red',
              }}
            />
          </View>
        )}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
      <TestCase
        modal
        itShould='render "First Layout" view and ignore "Ignored Layout" when accessibility is true'>
        <View accessible={true} style={styles.accessibilityContainer}>
          <View
            style={[styles.accessibilityLayout, {backgroundColor: 'green'}]}
            importantForAccessibility="yes">
            <Text>First layout</Text>
          </View>
          <View
            style={[styles.accessibilityLayout, {backgroundColor: 'yellow'}]}
            importantForAccessibility="no-hide-descendants">
            <Text>Ignored Layout</Text>
          </View>
        </View>
      </TestCase>
      <TestCase
        modal
        skip // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/600
        itShould="render a view with aria-valuemax accessibility prop">
        <View
          accessible={true}
          aria-valuemax={1000}
          style={[styles.accessibilityLayout, {backgroundColor: 'green'}]}>
          <Text>aria-valuemax: 100</Text>
        </View>
      </TestCase>
      <TestCase
        modal
        skip // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/600
        itShould="render a view with aria-valuemin accessibility prop">
        <View
          accessible={true}
          aria-valuemin={10}
          style={[styles.accessibilityLayout, {backgroundColor: 'green'}]}>
          <Text>aria-valuemin: 10</Text>
        </View>
      </TestCase>
      <TestCase
        modal
        skip // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/600
        itShould="render a view with aria-valuenow accessibility prop">
        <View
          accessible={true}
          aria-valuenow={55}
          style={[styles.accessibilityLayout, {backgroundColor: 'green'}]}>
          <Text>aria-valuemin: 55</Text>
        </View>
      </TestCase>
      <TestCase
        modal
        skip // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/600
        itShould="render a view with aria-valuetext accessibility prop">
        <View
          accessible={true}
          aria-valuetext={'Test Text'}
          style={[styles.accessibilityLayout, {backgroundColor: 'green'}]}>
          <Text>aria-valuemin: Test Text</Text>
        </View>
      </TestCase>
      <TestCase
        modal
        skip // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/599
        itShould="render a view with aria-selected accessibility prop">
        <ViewAccessibilityAriaSelected />
      </TestCase>
      <TestCase
        modal
        itShould="make the screen reader say 'This view has a red background and no text' when clicking on the View component with accessibilityLabel prop">
        <View
          accessible={true}
          accessibilityLabel="This view has a red background and no text"
          style={[styles.accessibilityLayout, {backgroundColor: 'red'}]}
        />
      </TestCase>
      <TestCase
        modal
        itShould="make the screen reader say/display 'This view has a red background and no text' when clicking on the View component with aria-label prop">
        <View
          accessible={true}
          aria-label="This view has a red background and no text"
          style={[styles.accessibilityLayout, {backgroundColor: 'red'}]}
        />
      </TestCase>
      <TestCase
        modal
        itShould="make the screen reader say/display 'busy' after clicking on the backgroud">
        <View
          accessible={true}
          aria-busy={true}
          style={styles.accessibilityLayout}
        />
      </TestCase>
      <TestCase
        modal
        itShould="make the screen reader say/display: 'checked, mixed' when both button are 'checked', 'mixed' when one of the button is 'checked' and 'unchecked' when none of the button is 'checked'">
        <ViewAccessibilityAriaChecked />
      </TestCase>
      <TestCase modal itShould="make the screen reader say/display: 'disabled'">
        <View
          accessible={true}
          aria-disabled={true}
          style={styles.accessibilityLayout}
        />
      </TestCase>
      <TestCase modal itShould="make the screen reader hide 'Hidden layout'">
        <View accessible={true} style={styles.accessibilityContainer}>
          <View
            style={[styles.accessibilityLayout, {backgroundColor: 'green'}]}
            importantForAccessibility="yes">
            <Text>First layout</Text>
          </View>
          <View
            style={[styles.accessibilityLayout, {backgroundColor: 'yellow'}]}
            aria-hidden={true}>
            <Text>Hidden Layout</Text>
          </View>
        </View>
      </TestCase>
      <TestCase
        modal
        skip // works only on iOS
        itShould="make the screen reader hide 'Hidden layout' accessibilityHidden">
        <View accessible={true} style={styles.accessibilityContainer}>
          <View
            style={[styles.accessibilityLayout, {backgroundColor: 'green'}]}>
            <Text>First layout</Text>
          </View>
          <View
            style={[styles.accessibilityLayout, {backgroundColor: 'yellow'}]}
            accessibilityElementsHidden={true}>
            <Text>Hidden Layout</Text>
          </View>
        </View>
      </TestCase>
      <TestCase
        modal
        itShould="make the screen reader say/display 'This view has a red background' and 'Hint: and no text'">
        <View
          accessible={true}
          aria-label="This view has a red background"
          accessibilityHint="Hint: and no text"
          style={[styles.accessibilityLayout, {backgroundColor: 'red'}]}
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
    <View style={{height: 100, width: '100%', flexDirection: 'row'}}>
      <View
        style={{backgroundColor: 'green'}}
        onTouchEnd={
          props.disableOuterContainerTouch
            ? undefined
            : () => {
                props.setState(prev => ({...prev, outerContainer: true}));
              }
        }>
        <View
          style={{height: 100, width: 100, backgroundColor: 'red'}}
          pointerEvents={props.pointerEventsOuter}
          onTouchEnd={() => {
            props.setState(prev => ({...prev, outer: true}));
          }}>
          <View
            style={{
              height: 40,
              width: 40,
              backgroundColor: 'blue',
              margin: 30,
            }}
            onTouchEnd={() => {
              props.setState(prev => ({...prev, inner: true}));
            }}
            pointerEvents={props.pointerEventsInner}
          />
        </View>
      </View>
      <Button label="reset" onPress={props.reset} />
    </View>
  );
}

function SelectedView({
  itemId,
  selectedId,
  setSelectedId,
}: {
  itemId: number;
  selectedId: number;
  setSelectedId: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <View
      aria-selected={selectedId === itemId}
      accessibilityState={{selected: selectedId === itemId}}
      style={[styles.accessibilityLayout, {borderBottomWidth: 2}]}>
      <Text
        style={{width: '100%', height: '100%'}}
        onPress={() => setSelectedId(itemId)}>
        aria-selected {String(selectedId === itemId)}
      </Text>
    </View>
  );
}

function ViewAccessibilityAriaSelected() {
  const [selectedId, setSelectedId] = useState<number>(1);

  return (
    <View accessible={true} style={styles.accessibilityContainer}>
      {Array.from({length: 5}, (_, index) => index + 1).map(id => (
        <SelectedView
          key={id}
          itemId={id}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
        />
      ))}
    </View>
  );
}

function ViewAccessibilityAriaChecked() {
  const [firstChecked, setFirstChecked] = useState<boolean>(false);
  const [secondChecked, setSecondChecked] = useState<boolean>(false);

  const checked = firstChecked && secondChecked;
  const mixed = firstChecked !== secondChecked;

  return (
    <View
      accessible={true}
      aria-checked={checked ? true : mixed ? 'mixed' : false}
      style={[styles.accessibilityLayout, {height: 200}]}
      accessibilityRole="checkbox"
      accessibilityState={{checked}}>
      <Button
        label={`First Element is ${firstChecked ? 'checked' : 'unchecked'}`}
        onPress={() => setFirstChecked(!firstChecked)}
      />
      <Button
        label={`Second Element is ${secondChecked ? 'checked' : 'unchecked'}`}
        onPress={() => setSecondChecked(!secondChecked)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  squaresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'gray',
  },
  square: {
    width: 100,
    height: 100,
    backgroundColor: 'lightblue',
    margin: 4,
  },
  squareContent: {
    textAlignVertical: 'center',
    textAlign: 'center',
    height: '100%',
  },
  accessibilityContainer: {
    width: '100%',
    backgroundColor: 'gray',
  },
  accessibilityLayout: {
    width: '100%',
    height: 100,
    backgroundColor: 'lightblue',
  },
});
