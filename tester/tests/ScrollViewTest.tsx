import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TextInput,
  Platform,
} from 'react-native';
import {TestSuite, TestCase} from '@rnoh/testerino';
import React, {useEffect, useRef, useState} from 'react';
import {Button, ObjectDisplayer} from '../components';
import {GestureResponderEvent} from 'react-native/Libraries/Types/CoreEventTypes';
const commonProps = {
  style: {
    borderWidth: 3,
    borderColor: 'firebrick',
  },
  contentContainerStyle: {
    alignItems: 'center' as 'center',
    justifyContent: 'center' as 'center',
  },
  children: getScrollViewContent({}),
};
export function ScrollViewTest() {
  return (
    <TestSuite name="ScrollView">
      <TestSuite name="styles">
        <TestCase
          modal
          itShould="render scroll view with different border radii (topLeft, topRight, ...)">
          <View style={styles.wrapperView}>
            <ScrollView
              {...commonProps}
              style={{
                borderColor: 'firebrick',
                backgroundColor: 'beige',
                borderWidth: 3,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 20,
                borderBottomRightRadius: 30,
                borderBottomLeftRadius: 40,
              }}
            />
          </View>
        </TestCase>
        <TestCase
          modal
          itShould="render scroll view with different border widths (left, right, top, bottom)">
          <View style={styles.wrapperView}>
            <ScrollView
              {...commonProps}
              style={{
                borderColor: 'firebrick',
                backgroundColor: 'beige',
                borderLeftWidth: 3,
                borderTopWidth: 6,
                borderRightWidth: 9,
                borderBottomWidth: 12,
              }}></ScrollView>
          </View>
        </TestCase>
        <TestCase
          modal
          itShould="render scroll view with different border colors (left, right, top, bottom)">
          <View style={styles.wrapperView}>
            <ScrollView
              {...commonProps}
              style={{
                backgroundColor: 'beige',
                borderWidth: 3,
                borderLeftColor: 'firebrick',
                borderTopColor: 'chocolate',
                borderRightColor: 'black',
                borderBottomColor: 'blue',
              }}></ScrollView>
          </View>
        </TestCase>
        <TestCase
          modal
          itShould="render  scroll view with different border radii (start, end)">
          <View style={styles.wrapperView}>
            <ScrollView
              {...commonProps}
              style={{
                borderColor: 'firebrick',
                backgroundColor: 'beige',
                borderWidth: 3,
                borderTopStartRadius: 10,
                borderTopEndRadius: 20,
                borderBottomEndRadius: 30,
                borderBottomStartRadius: 40,
              }}></ScrollView>
          </View>
        </TestCase>
        <TestCase
          modal
          itShould="render scroll view with different border widths (start, end)">
          <View style={styles.wrapperView}>
            <ScrollView
              {...commonProps}
              style={{
                borderColor: 'firebrick',
                backgroundColor: 'beige',
                borderStartWidth: 3,
                borderTopWidth: 6,
                borderEndWidth: 9,
                borderBottomWidth: 12,
              }}></ScrollView>
          </View>
        </TestCase>
        <TestCase
          modal
          itShould="render scroll view with different border colors (start, end)">
          <View style={styles.wrapperView}>
            <ScrollView
              {...commonProps}
              style={{
                backgroundColor: 'beige',
                borderWidth: 3,
                borderStartColor: 'firebrick',
                borderEndColor: 'black',
                borderTopColor: 'chocolate',
                borderBottomColor: 'blue',
              }}
            />
          </View>
        </TestCase>
      </TestSuite>
      <TestSuite name="contentContainerStyle">
        <TestCase
          modal
          itShould="render scrollview with content container with different border radii (topLeft, topRight, ...) (contentContainerStyle)">
          <View style={styles.wrapperView}>
            <ScrollView
              {...commonProps}
              style={{
                borderWidth: 3,
                borderColor: 'green',
              }}
              contentContainerStyle={{
                borderColor: 'firebrick',
                backgroundColor: 'beige',
                overflow: 'hidden',
                borderWidth: 3,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 20,
                borderBottomRightRadius: 30,
                borderBottomLeftRadius: 40,
              }}
            />
          </View>
        </TestCase>
        <TestCase
          modal
          itShould="render scroll view with contentContainer with different border widths (left, right, top, bottom) (contentContainerStyle)">
          <View style={styles.wrapperView}>
            <ScrollView
              {...commonProps}
              style={{
                borderWidth: 3,
                borderColor: 'green',
              }}
              contentContainerStyle={{
                borderColor: 'firebrick',
                backgroundColor: 'beige',
                borderLeftWidth: 3,
                borderWidth: 3,
                borderTopWidth: 6,
                borderRightWidth: 9,
                borderBottomWidth: 12,
              }}></ScrollView>
          </View>
        </TestCase>
        <TestCase
          modal
          itShould="render scroll view contentContainer with different border colors (left, right, top, bottom) (contentContainerStyle)">
          <View style={styles.wrapperView}>
            <ScrollView
              {...commonProps}
              style={{
                borderWidth: 3,
                borderColor: 'green',
              }}
              contentContainerStyle={{
                backgroundColor: 'beige',
                borderWidth: 3,
                borderLeftColor: 'firebrick',
                borderTopColor: 'chocolate',
                borderRightColor: 'black',
                borderBottomColor: 'blue',
              }}
            />
          </View>
        </TestCase>
      </TestSuite>
      <TestSuite name="scroll indicators / scrollbar">
        <TestCase modal itShould="have persistent scrollbar">
          <View style={styles.wrapperView}>
            <ScrollView persistentScrollbar={true} {...commonProps} />
          </View>
        </TestCase>
        <TestCase modal itShould="shows white vertical scroll indicator">
          <View style={styles.wrapperView}>
            <ScrollView {...commonProps} indicatorStyle={'white'} />
          </View>
        </TestCase>
        <TestCase modal itShould="show vertical scroll indicator">
          <View style={styles.wrapperView}>
            <ScrollView {...commonProps} showsVerticalScrollIndicator={true} />
          </View>
        </TestCase>
        <TestCase modal itShould="hide vertical scroll indicator">
          <View style={styles.wrapperView}>
            <ScrollView showsVerticalScrollIndicator={false} {...commonProps} />
          </View>
        </TestCase>
        <TestCase modal itShould="show horizontal scroll indicator">
          <View style={styles.wrapperView}>
            <ScrollView
              showsHorizontalScrollIndicator={true}
              horizontal
              {...commonProps}>
              {getScrollViewContentHorizontal({})}
            </ScrollView>
          </View>
        </TestCase>
        <TestCase modal itShould="hide horizontal scroll indicator">
          <View style={styles.wrapperView}>
            <ScrollView
              showsHorizontalScrollIndicator={false}
              horizontal
              {...commonProps}>
              {getScrollViewContentHorizontal({})}
            </ScrollView>
          </View>
        </TestCase>
      </TestSuite>
      <TestSuite
        name="sticky headers" /* (sticky headers fail on Android when Fabric is enabled) */
      >
        <TestCase
          itShould="stick item 1 and 4 (stickyHeaderIndices)"
          skip={Platform.OS === 'android'}>
          <View style={styles.wrapperView}>
            <ScrollView stickyHeaderIndices={[0, 3]} nestedScrollEnabled>
              {getScrollViewContent({})}
            </ScrollView>
          </View>
        </TestCase>
        <TestCase
          skip={Platform.OS === 'android'}
          itShould="hide sticked item 1 or 4 when scrolling down (stickyHeaderHiddenOnScroll)">
          <View style={styles.wrapperView}>
            <ScrollView
              stickyHeaderIndices={[0, 3]}
              nestedScrollEnabled
              stickyHeaderHiddenOnScroll>
              {getScrollViewContent({})}
            </ScrollView>
          </View>
        </TestCase>
        <TestCase
          skip={Platform.OS === 'android'}
          itShould="stick item 13 and 20 to the bottom (invertStickyHeaders)"
          //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/309
        >
          <View style={styles.wrapperView}>
            <ScrollView
              stickyHeaderIndices={[12, 19]}
              nestedScrollEnabled
              invertStickyHeaders>
              {getScrollViewContent({})}
            </ScrollView>
          </View>
        </TestCase>
        <TestCase itShould="display Text 'custom sticky header' in the place of components 1 and 4 (shouldn't stick) (StickyHeaderComponent)">
          <View style={styles.wrapperView}>
            <ScrollView
              stickyHeaderIndices={[0, 3]}
              nestedScrollEnabled
              StickyHeaderComponent={() => <Text>custom sticky header</Text>}>
              {getScrollViewContent({})}
            </ScrollView>
          </View>
        </TestCase>
      </TestSuite>
      <TestSuite name="pointer events">
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
          //it seems there's a bug on Android, which causes pointerEvents to not work correctly for Scrollviews
          skip // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/424
          itShould="[FAILS on Android/Harmony] call only outer when pressing inner view"
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
          //it seems there's a bug on Android, which causes pointerEvents to not work correctly for Scrollviews
          itShould="[FAILS on Android] call inner and outer only when pressing inner view"
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
          //it seems there's a bug on Android, which causes pointerEvents to not work correctly for Scrollviews
          itShould="[FAILS on Android] not call inner or outer when pressing inner or outer views"
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
      <TestSuite name="snap to">
        <TestCase
          modal
          skip
          itShould="[FAILS on all platforms?] snaps to each child "
          //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/307
        >
          <View style={[styles.wrapperView, {flexDirection: 'row'}]}>
            <ScrollView
              {...commonProps}
              disableIntervalMomentum={true}
              decelerationRate={'fast'}
            />
          </View>
        </TestCase>
        <TestCase
          modal
          itShould="snaps to each second child (rectangle indices: 1, 3, 5, 7...) (snapToInterval)">
          <View style={[styles.wrapperView, {flexDirection: 'row'}]}>
            <ScrollView
              {...commonProps}
              snapToInterval={100}
              decelerationRate={'fast'}
            />
          </View>
        </TestCase>
        <TestCase
          modal
          itShould="snaps to in increasing multiples of 50 pixels (rectangle indices: 1, 2, 4, 7, 11, 16) (snapToOffset)) ">
          <View style={[styles.wrapperView, {flexDirection: 'row'}]}>
            <ScrollView
              {...commonProps}
              snapToOffsets={[50, 150, 300, 500, 750]}
              decelerationRate={'fast'}>
              {getScrollViewContent({amountOfChildren: 21})}
            </ScrollView>
          </View>
        </TestCase>
      </TestSuite>
      <TestSuite name="other props">
        <TestCase
          modal
          itShould="scroll should be disabled (it renders with the 5th element at the top)">
          <View style={styles.wrapperView}>
            <ScrollView {...commonProps} scrollEnabled={false} />
          </View>
        </TestCase>
        <TestCase modal itShould="display horizontal scroll view">
          <View
            style={{
              width: '100%',
              height: 150,
            }}>
            <ScrollView {...commonProps} horizontal={true} />
          </View>
        </TestCase>
        <TestCase
          modal
          itShould="display ScrollView with the third view at the top (contentOffset)"
          //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/305
        >
          <ContentOffsetTestCase />
        </TestCase>
        <TestCase
          modal
          itShould="scroll when contentOffset property is changed (contentOffset)"
          //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/305
        >
          <ToggleContentOffsetTestCase />
        </TestCase>
        <TestCase
          modal
          itShould="toggle backface visibility on button press (the component should become invisible)">
          <BackfaceVisibilityTestCase />
        </TestCase>
        <TestCase
          modal
          skip
          itShould="[FAILS on Harmony/Android] display ScrollView with different contentInsets (contentInset)"
          //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/304
        >
          <View style={styles.wrapperView}>
            <ScrollView
              {...commonProps}
              contentInset={{top: 10, right: 20, bottom: 30, left: 40}}
            />
          </View>
        </TestCase>
        <TestCase
          modal
          skip
          itShould="[FAILS on Harmony/Android] adjust the scrollview when showing keyboard (automaticallyAdjustKeyboardInsets)"
          //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/302
        >
          <View style={styles.wrapperView}>
            <TextInput style={styles.textInput} />
            <ScrollView {...commonProps} automaticallyAdjustKeyboardInsets />
          </View>
        </TestCase>
        <TestCase
          modal
          itShould="display amount of on drag/momentum begin/end events">
          <MomentumTestCase />
        </TestCase>
        <TestCase
          modal
          itShould="display current contentHeight (onContentSizeChange)">
          <OnContentSizeChangeTestCase />
        </TestCase>
        <TestCase
          modal
          itShould="display onScroll native event throttled every second">
          <ObjectDisplayer
            renderContent={setObject => {
              return (
                <ScrollView
                  {...commonProps}
                  scrollEventThrottle={1000}
                  onScroll={(e: {nativeEvent: Object}) => {
                    setObject(e.nativeEvent);
                  }}
                />
              );
            }}
          />
        </TestCase>
        <TestCase
          modal
          itShould="the left scrollview should decelerate faster (stops earlier) than the right one (decelarationRate)">
          <View style={[styles.wrapperView, {flexDirection: 'row'}]}>
            <ScrollView {...commonProps} decelerationRate={0.8} />
            <ScrollView {...commonProps} decelerationRate={0.999} />
          </View>
        </TestCase>
        <TestCase
          modal
          skip
          itShould="the left scrollview should dismiss the keyboard on scroll and the right one shouldn't (keyboardDismissMode)"
          //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/310
        >
          <View>
            <TextInput style={styles.textInput} />
            <View style={[styles.wrapperView, {flexDirection: 'row'}]}>
              <ScrollView {...commonProps} keyboardDismissMode={'on-drag'}>
                {getScrollViewContent({})}
              </ScrollView>
              <ScrollView {...commonProps} keyboardDismissMode={'none'}>
                {getScrollViewContent({})}
              </ScrollView>
            </View>
          </View>
        </TestCase>
        <TestCase
          modal
          skip
          itShould="[FAILS on Harmony/ Android Emulator] the left scrollview should dismiss the keyboard on tap and the right one shouldn't (keyboardShouldPersistTaps)"
          //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/311
        >
          <View>
            <TextInput style={styles.textInput} />
            <View style={[styles.wrapperView, {flexDirection: 'row'}]}>
              <ScrollView
                {...commonProps}
                keyboardShouldPersistTaps={'never'}
              />
              <ScrollView
                {...commonProps}
                keyboardShouldPersistTaps={'always'}
              />
            </View>
          </View>
        </TestCase>
        <TestCase
          modal
          itShould="the left scrollview should bounce (briefly scroll beyond the content to show the view below and then come back to top/bottom accordingly)">
          <View style={[styles.wrapperView, {flexDirection: 'row'}]}>
            <ScrollView {...commonProps} />
            <ScrollView {...commonProps} bounces={false} />
          </View>
        </TestCase>
        <TestCase
          modal
          skip
          itShould="[FAILS on Harmony/Android] scroll outside of the content when pressing the button (scrollToOverflowEnabled)"
          //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/315
        >
          <ScrollToOverflowEnabledTestCase />
        </TestCase>
        <TestCase
          modal
          skip
          itShould="the left scrollview should allow for nested scroll while the right one shouldn't (nestedScrollEnabled)"
          //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/312
        >
          <View
            style={[
              styles.wrapperView,
              {flexDirection: 'row', alignContent: 'space-between'},
            ]}>
            <ScrollView {...commonProps}>
              <ScrollView
                nestedScrollEnabled
                style={{
                  width: '70%',
                  height: 200,
                  borderColor: 'firebrick',
                  borderWidth: 2,
                }}>
                {getScrollViewContent({
                  style: {backgroundColor: 'green'},
                  amountOfChildren: 5,
                })}
              </ScrollView>
              {getScrollViewContent({})}
            </ScrollView>
            <ScrollView {...commonProps}>
              <ScrollView
                nestedScrollEnabled={false}
                style={{
                  width: '70%',
                  height: 200,
                  borderColor: 'firebrick',
                  borderWidth: 2,
                }}>
                {getScrollViewContent({
                  style: {backgroundColor: 'green'},
                  amountOfChildren: 5,
                })}
              </ScrollView>
              {getScrollViewContent({})}
            </ScrollView>
          </View>
        </TestCase>
        <TestCase
          modal
          itShould="scroll down on the btn press, but prevent scrolling by dragging (scrollEnabled)">
          <ScrollEnabledTestCase />
        </TestCase>
        <TestCase
          modal
          itShould="allow to scroll to the end of the content (snapToEnd = false, from 30 rectangle indice)">
          <ScrollViewSnapToEnd />
        </TestCase>
        <TestCase
          modal
          itShould="allow to scroll to the start of the content (snapToStart = false, from 60 rectangle indice)">
          <ScrollViewSnapToStart />
        </TestCase>
        <TestCase
          modal
          itShould="allow to scroll from start to 30, then from 60 to the end (snapToStart = false, snapToEnd = false)">
          <ScrollViewSnapToStartAndEnd />
        </TestCase>
      </TestSuite>
      <TestCase modal itShould="snap to page">
        <PagingEnabledTest />
      </TestCase>
    </TestSuite>
  );
}
const PagingEnabledTest = () => {
  const width = 300;
  const style = StyleSheet.create({
    view1: {
      backgroundColor: 'pink',
    },
    view2: {
      backgroundColor: 'powderblue',
    },
    base: {
      height: 700,
    },
    scrollview: {
      marginVertical: 40,
      width: width,
    },
    box: {
      height: 150,
      width: 150,
      backgroundColor: 'blue',
      borderRadius: 5,
    },
  });
  return (
    <ScrollView style={style.scrollview} horizontal pagingEnabled>
      <View style={[{width: width}, style.base, style.view1]}></View>
      <View style={[{width: width}, style.base, style.view2]}></View>
      <View style={[{width: width}, style.base, style.view1]}></View>
      <View style={[{width: width}, style.base, style.view2]}></View>
    </ScrollView>
  );
}; 

function MomentumTestCase() {
  const [hasDragBegan, setHasDragBegan] = useState(0);
  const [hasDragEnded, setHasDragEnded] = useState(0);
  const [hasMomentumBegan, setHasMomentumBegan] = useState(0);
  const [hasMomentumEnded, setHasMomentumEnded] = useState(0);

  return (
    <>
      <Button
        label="Reset"
        onPress={() => {
          setHasDragBegan(0);
          setHasDragEnded(0);
          setHasMomentumBegan(0);
          setHasMomentumEnded(0);
        }}
      />
      <View style={{backgroundColor: 'white', width: '100%'}}>
        <Text style={{height: 16}}>hasMomentumBegan: {hasMomentumBegan}</Text>
        <Text style={{height: 16}}>hasMomentumEnded: {hasMomentumEnded}</Text>
        <Text style={{height: 16}}>hasDragBegan: {hasDragBegan}</Text>
        <Text style={{height: 16}}>hasDragEnded: {hasDragEnded}</Text>
      </View>

      <View style={{width: 200, height: 200}}>
        <ScrollView
          onScrollBeginDrag={() => {
            setHasDragBegan(p => p + 1);
          }}
          onScrollEndDrag={() => {
            setHasDragEnded(p => p + 1);
          }}
          onMomentumScrollBegin={() => {
            setHasMomentumBegan(p => p + 1);
          }}
          onMomentumScrollEnd={() => {
            setHasMomentumEnded(p => p + 1);
          }}>
          <View style={{backgroundColor: 'red', width: '100%', height: 150}} />
          <View style={{backgroundColor: 'blue', width: '100%', height: 150}} />
          <View
            style={{backgroundColor: 'green', width: '100%', height: 150}}
          />
          <View style={{backgroundColor: 'red', width: '100%', height: 150}} />
        </ScrollView>
      </View>
    </>
  );
}

function ScrollEnabledTestCase() {
  const scrollRef = React.useRef<ScrollView>(null);
  return (
    <View style={styles.wrapperView}>
      <Button
        label={'Scroll To offset y 150'}
        onPress={() => {
          scrollRef.current?.scrollTo({x: 0, y: 150, animated: false});
        }}
      />
      <ScrollView style={{flex: 1}} scrollEnabled={false} ref={scrollRef}>
        {getScrollViewContent({})}
      </ScrollView>
    </View>
  );
}

function ScrollToOverflowEnabledTestCase() {
  const ref = useRef<ScrollView>(null);
  return (
    <View style={styles.wrapperView}>
      <Button
        label={`Scroll outside of the content`}
        onPress={() => {
          ref.current?.scrollTo({x: 0, y: -60, animated: true});
        }}
      />
      <ScrollView scrollToOverflowEnabled={true} ref={ref}>
        {getScrollViewContent({})}
      </ScrollView>
    </View>
  );
}
function OnContentSizeChangeTestCase() {
  const [amountOfChildren, setAmountOfChildren] = useState(3);
  return (
    <ObjectDisplayer
      renderContent={setObject => {
        return (
          <View style={{width: '100%', height: '70%'}}>
            <Button
              label={`Add one more item`}
              onPress={() => {
                setAmountOfChildren(amountOfChildren + 1);
              }}
            />
            <ScrollView
              onContentSizeChange={(_, contentHeight) => {
                setObject({contentHeight});
              }}>
              {getScrollViewContent({amountOfChildren: amountOfChildren})}
            </ScrollView>
          </View>
        );
      }}
    />
  );
}

function ContentOffsetTestCase() {
  return (
    <View style={styles.wrapperView}>
      <ScrollView
        style={{
          ...styles.wrapperView,
        }}
        contentOffset={{x: 0, y: 100}}>
        {getScrollViewContent({})}
      </ScrollView>
    </View>
  );
}

function ToggleContentOffsetTestCase() {
  const [contentOffset, setContentOffset] = useState(100);
  useEffect(() => {
    const id = setInterval(() => {
      setContentOffset(prev => (prev + 50) % 200);
    }, 1000);
    return () => {
      clearInterval(id);
    };
  }, []);

  return (
    <View style={styles.wrapperView}>
      <ScrollView
        style={{
          ...styles.wrapperView,
        }}
        contentOffset={{x: 0, y: contentOffset}}>
        {getScrollViewContent({})}
      </ScrollView>
    </View>
  );
}

function BackfaceVisibilityTestCase() {
  const [backfaceVisibility, setBackfaceVisibility] = useState(true);

  return (
    <View style={styles.wrapperView}>
      <Button
        label={`Make backface ${backfaceVisibility ? 'invisible' : 'visible'}`}
        onPress={() => {
          setBackfaceVisibility(!backfaceVisibility);
        }}
      />
      <ScrollView
        style={{
          ...styles.wrapperView,
          backfaceVisibility: backfaceVisibility ? 'visible' : 'hidden',
          transform: [{rotateX: '180deg'}],
        }}>
        {getScrollViewContent({})}
      </ScrollView>
    </View>
  );
}

interface ScrollViewContentProps {
  style?: StyleProp<ViewStyle>;
  amountOfChildren?: number;
  onTouchEnd?: (event: GestureResponderEvent) => void;
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto' | undefined;
}
// using this as a component breaks sticky headers because react native sees it then as a single component
function getScrollViewContent({
  style,
  amountOfChildren = 20,
  onTouchEnd,
  pointerEvents,
}: ScrollViewContentProps) {
  return new Array(amountOfChildren).fill(0).map((_, idx) => {
    return (
      <View
        key={idx}
        style={[
          {
            width: '100%',
            height: 50,
            backgroundColor: idx % 2 ? 'pink' : 'beige',
            justifyContent: 'center',
          },
          style,
        ]}
        pointerEvents={pointerEvents}
        onTouchEnd={onTouchEnd}>
        <Text style={{textAlign: 'center', height: 15}}> {idx + 1}</Text>
      </View>
    );
  });
}

function getScrollViewContentHorizontal({
  style,
  amountOfChildren = 20,
}: ScrollViewContentProps) {
  return new Array(amountOfChildren).fill(0).map((_, idx) => {
    return (
      <View
        key={idx}
        style={[
          {
            width: 50,
            height: '100%',
            backgroundColor: idx % 2 ? 'pink' : 'beige',
            justifyContent: 'center',
          },
          style,
        ]}>
        <Text style={{textAlign: 'center', height: 15}}> {idx + 1}</Text>
      </View>
    );
  });
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
        style={{backgroundColor: 'red'}}
        onTouchEnd={
          props.disableOuterContainerTouch
            ? undefined
            : () => {
                props.setState(prev => ({...prev, outerContainer: true}));
              }
        }>
        <ScrollView
          nestedScrollEnabled
          style={{
            height: 100,
            width: 100,
            backgroundColor: 'green',
            padding: 20,
          }}
          pointerEvents={props.pointerEventsOuter}
          onTouchEnd={() => {
            props.setState(prev => ({...prev, outer: true}));
          }}>
          {getScrollViewContent({
            amountOfChildren: 3,
            onTouchEnd: () => {
              props.setState(prev => ({...prev, inner: true}));
            },
            pointerEvents: props.pointerEventsInner,
          })}
        </ScrollView>
      </View>
      <Button label="reset" onPress={props.reset} />
    </View>
  );
}

function ScrollViewSnapToEnd() {
  return (
    <View style={styles.wrapperView}>
      <ScrollView
        style={{
          ...styles.wrapperView,
        }}
        snapToEnd={false}
        snapToOffsets={[1450]}>
        {getScrollViewContent({amountOfChildren: 100})}
      </ScrollView>
    </View>
  );
}

function ScrollViewSnapToStart() {
  return (
    <View style={styles.wrapperView}>
      <ScrollView
        style={{
          ...styles.wrapperView,
        }}
        snapToStart={false}
        snapToOffsets={[2950]}>
        {getScrollViewContent({amountOfChildren: 100})}
      </ScrollView>
    </View>
  );
}

function ScrollViewSnapToStartAndEnd() {
  return (
    <View style={styles.wrapperView}>
      <ScrollView
        style={{
          ...styles.wrapperView,
        }}
        snapToStart={false}
        snapToEnd={false}
        snapToOffsets={[1450, 2950]}>
        {getScrollViewContent({amountOfChildren: 100})}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapperView: {
    height: 300,
    width: '60%',
  },
  button: {
    width: 160,
    height: 36,
    backgroundColor: 'hsl(190, 50%, 70%)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'silver',
    backgroundColor: '#444',
    height: 32, // hack
    borderRadius: 8,
    marginTop: 8,
    padding: 8,
    fontSize: 16,
    color: 'white',
  },
});
