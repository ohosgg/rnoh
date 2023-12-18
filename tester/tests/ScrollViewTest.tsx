import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TextInput,
  Platform,
  ScrollViewProps,
} from 'react-native';
import {TestSuite, TestCase} from '@rnoh/testerino';
import React, {useEffect, useRef, useState} from 'react';
import {Button, ObjectDisplayer} from '../components';
import {GestureResponderEvent} from 'react-native/Libraries/Types/CoreEventTypes';

const COMMON_PROPS = {
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
              {...COMMON_PROPS}
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
              {...COMMON_PROPS}
              style={{
                borderColor: 'firebrick',
                backgroundColor: 'beige',
                borderLeftWidth: 3,
                borderTopWidth: 6,
                borderRightWidth: 9,
                borderBottomWidth: 12,
              }}
            />
          </View>
        </TestCase>
        <TestCase
          modal
          itShould="render scroll view with different border colors (left, right, top, bottom)">
          <View style={styles.wrapperView}>
            <ScrollView
              {...COMMON_PROPS}
              style={{
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
        <TestCase
          modal
          itShould="render  scroll view with different border radii (start, end)">
          <View style={styles.wrapperView}>
            <ScrollView
              {...COMMON_PROPS}
              style={{
                borderColor: 'firebrick',
                backgroundColor: 'beige',
                borderWidth: 3,
                borderTopStartRadius: 10,
                borderTopEndRadius: 20,
                borderBottomEndRadius: 30,
                borderBottomStartRadius: 40,
              }}
            />
          </View>
        </TestCase>
        <TestCase
          modal
          itShould="render scroll view with different border widths (start, end)">
          <View style={styles.wrapperView}>
            <ScrollView
              {...COMMON_PROPS}
              style={{
                borderColor: 'firebrick',
                backgroundColor: 'beige',
                borderStartWidth: 3,
                borderTopWidth: 6,
                borderEndWidth: 9,
                borderBottomWidth: 12,
              }}
            />
          </View>
        </TestCase>
        <TestCase
          modal
          itShould="render scroll view with different border colors (start, end)">
          <View style={styles.wrapperView}>
            <ScrollView
              {...COMMON_PROPS}
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
              {...COMMON_PROPS}
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
              {...COMMON_PROPS}
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
              }}
            />
          </View>
        </TestCase>
        <TestCase
          modal
          itShould="render scroll view contentContainer with different border colors (left, right, top, bottom) (contentContainerStyle)">
          <View style={styles.wrapperView}>
            <ScrollView
              {...COMMON_PROPS}
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
            <ScrollView persistentScrollbar={true} {...COMMON_PROPS} />
          </View>
        </TestCase>
        <TestCase modal itShould="shows white vertical scroll indicator">
          <View style={styles.wrapperView}>
            <ScrollView {...COMMON_PROPS} indicatorStyle={'white'} />
          </View>
        </TestCase>
        <TestCase modal itShould="show vertical scroll indicator">
          <View style={styles.wrapperView}>
            <ScrollView {...COMMON_PROPS} showsVerticalScrollIndicator={true} />
          </View>
        </TestCase>
        <TestCase modal itShould="hide vertical scroll indicator">
          <View style={styles.wrapperView}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              {...COMMON_PROPS}
            />
          </View>
        </TestCase>
        <TestCase modal itShould="show horizontal scroll indicator">
          <View style={styles.wrapperView}>
            <ScrollView
              showsHorizontalScrollIndicator={true}
              horizontal
              {...COMMON_PROPS}>
              {getScrollViewContentHorizontal({})}
            </ScrollView>
          </View>
        </TestCase>
        <TestCase modal itShould="hide horizontal scroll indicator">
          <View style={styles.wrapperView}>
            <ScrollView
              showsHorizontalScrollIndicator={false}
              horizontal
              {...COMMON_PROPS}>
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
      <TestSuite name="snapTo*">
        <SnapTestCases
          scrollViewProps={{disableIntervalMomentum: false, horizontal: false}}
        />
      </TestSuite>
      <TestSuite name="disableIntervalMomentum">
        <SnapTestCases
          scrollViewProps={{disableIntervalMomentum: true, horizontal: false}}
        />
      </TestSuite>
      <TestSuite name="other props">
        <TestCase
          modal
          itShould="scroll should be disabled (it renders with the 5th element at the top)">
          <View style={styles.wrapperView}>
            <ScrollView {...COMMON_PROPS} scrollEnabled={false} />
          </View>
        </TestCase>
        <TestCase modal itShould="display horizontal scroll view">
          <View
            style={{
              width: '100%',
              height: 150,
            }}>
            <ScrollView {...COMMON_PROPS} horizontal={true} />
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
              {...COMMON_PROPS}
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
            <ScrollView {...COMMON_PROPS} automaticallyAdjustKeyboardInsets />
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
                  {...COMMON_PROPS}
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
            <ScrollView {...COMMON_PROPS} decelerationRate={0.8} />
            <ScrollView {...COMMON_PROPS} decelerationRate={0.999} />
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
              <ScrollView {...COMMON_PROPS} keyboardDismissMode={'on-drag'}>
                {getScrollViewContent({})}
              </ScrollView>
              <ScrollView {...COMMON_PROPS} keyboardDismissMode={'none'}>
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
                {...COMMON_PROPS}
                keyboardShouldPersistTaps={'never'}
              />
              <ScrollView
                {...COMMON_PROPS}
                keyboardShouldPersistTaps={'always'}
              />
            </View>
          </View>
        </TestCase>
        <TestCase
          modal
          itShould="the left scrollview should bounce (briefly scroll beyond the content to show the view below and then come back to top/bottom accordingly)">
          <View style={[styles.wrapperView, {flexDirection: 'row'}]}>
            <ScrollView {...COMMON_PROPS} />
            <ScrollView {...COMMON_PROPS} bounces={false} />
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
            <ScrollView {...COMMON_PROPS}>
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
            <ScrollView {...COMMON_PROPS}>
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
      </TestSuite>
      <TestCase modal itShould="flash scroll indicators">
        <FlashIndicatorsTest />
      </TestCase>
      <TestCase
        modal
        itShould="maintain scroll position when adding/removing elements">
        <AppendingList />
      </TestCase>
      <TestCase
        modal
        skip // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/498
        itShould="fill the remaining space of scroll view with yellow color but the element inside scroll view remains transparent">
        <ScrollViewEndFillColorTest />
      </TestCase>
    </TestSuite>
  );
}

function SnapTestCases(props: {scrollViewProps: ScrollViewProps}) {
  return (
    <>
      <TestCase
        modal
        itShould="not snap after item 6 when snapToEnd is set to false">
        <ScrollViewComparator
          scrollViewLength={ITEM_HEIGHT * 5}
          commonProps={{
            ...props.scrollViewProps,
            snapToOffsets: [ITEM_HEIGHT * 5],
            children: getScrollViewContent({amountOfChildren: 25}),
          }}
          lhsProps={{snapToEnd: true}}
          rhsProps={{snapToEnd: false}}
        />
      </TestCase>
      <TestCase
        modal
        itShould="not snap before item 6 when snapToStart is set to false">
        <ScrollViewComparator
          scrollViewLength={ITEM_HEIGHT * 5}
          commonProps={{
            ...props.scrollViewProps,
            snapToOffsets: [ITEM_HEIGHT * 5],
            children: getScrollViewContent({amountOfChildren: 25}),
          }}
          lhsProps={{snapToStart: true}}
          rhsProps={{snapToStart: false}}
        />
      </TestCase>
      <TestCase modal itShould="snap to page">
        <ScrollViewComparator
          scrollViewLength={ITEM_HEIGHT * 5}
          commonProps={{
            ...props.scrollViewProps,
            children: getScrollViewContent({amountOfChildren: 25}),
          }}
          lhsProps={{pagingEnabled: false}}
          rhsProps={{pagingEnabled: true}}
        />
      </TestCase>
      <TestCase modal itShould="snap to item 1, 3, 5, 7, 9, ...">
        <ScrollViewComparator
          scrollViewLength={ITEM_HEIGHT * 5}
          commonProps={{
            ...props.scrollViewProps,
            children: getScrollViewContent({amountOfChildren: 25}),
          }}
          lhsProps={{}}
          rhsProps={{snapToInterval: ITEM_HEIGHT * 2}}
        />
      </TestCase>
      <TestCase modal itShould="snap to item 2, 3, 7, and 11 and 21">
        <ScrollViewComparator
          scrollViewLength={ITEM_HEIGHT * 5}
          commonProps={{
            ...props.scrollViewProps,
            children: getScrollViewContent({amountOfChildren: 25}),
          }}
          lhsProps={{}}
          rhsProps={{
            snapToOffsets: [
              ITEM_HEIGHT,
              ITEM_HEIGHT * 2,
              ITEM_HEIGHT * 6,
              ITEM_HEIGHT * 10,
            ],
          }}
        />
      </TestCase>
      <TestSuite name="snapToAlignment">
        <TestCase modal itShould="snap to item {lhs: start, rhs: center}">
          <ScrollViewComparator
            scrollViewLength={ITEM_HEIGHT * 1.5}
            commonProps={{
              ...props.scrollViewProps,
              children: getScrollViewContent({amountOfChildren: 25}),
              snapToInterval: ITEM_HEIGHT,
            }}
            lhsProps={{snapToAlignment: 'start'}}
            rhsProps={{snapToAlignment: 'center'}}
          />
        </TestCase>
        <TestCase modal itShould="snap to item {lhs: start, rhs: end}">
          <ScrollViewComparator
            scrollViewLength={ITEM_HEIGHT * 1.5}
            commonProps={{
              ...props.scrollViewProps,
              children: getScrollViewContent({amountOfChildren: 25}),
              snapToInterval: ITEM_HEIGHT,
            }}
            lhsProps={{snapToAlignment: 'start'}}
            rhsProps={{snapToAlignment: 'end'}}
          />
        </TestCase>
      </TestSuite>
    </>
  );
}
const Item = (props: {label: string; mode: 'dark' | 'light'}) => {
  const stylesheet = StyleSheet.create({
    dark: {
      backgroundColor: '#47443D',
      color: 'white',
    },
    light: {
      backgroundColor: '#D9D0BB',
      color: 'black',
    },
    item: {
      height: 100,
    },
  });
  return (
    <View
      style={[
        props.mode === 'dark' ? stylesheet.dark : stylesheet.light,
        stylesheet.item,
      ]}>
      <Text>{props.label}</Text>
    </View>
  );
};

const ITEMS = Array.from({length: 20}, (_, index) => (
  <Item
    label={`Item${index}`}
    key={`item${index}`}
    mode={index % 2 ? 'light' : 'dark'}
  />
));
let itemCount = 20;
const AppendingList = () => {
  const [items, setItems] = useState<React.JSX.Element[]>(ITEMS);
  const styles = StyleSheet.create({
    scrollView: {
      width: 300,
      marginVertical: 50,
      height: 500,
    },
    row: {
      flexDirection: 'row',
    },
  });
  return (
    <View>
      <ScrollView
        automaticallyAdjustContentInsets={false}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        nestedScrollEnabled
        style={styles.scrollView}>
        {items.map((value, _index, _array) => React.cloneElement(value))}
      </ScrollView>
      <View style={styles.row}>
        <Button
          label="Add to top"
          onPress={() => {
            setItems(prev => {
              const idx = itemCount++;
              return [
                <Item
                  label={`added Item ${idx}`}
                  key={`item${idx}`}
                  mode={idx % 2 ? 'light' : 'dark'}
                />,
              ].concat(prev);
            });
          }}
        />
        <Button
          label="Remove top"
          onPress={() => {
            setItems(prev => prev.slice(1));
          }}
        />
      </View>
      <View style={styles.row}>
        <Button
          label="Add to end"
          onPress={() => {
            setItems(prev => {
              const idx = itemCount++;
              return prev.concat([
                <Item
                  label={`added Item ${idx}`}
                  key={`item${idx}`}
                  mode={idx % 2 ? 'light' : 'dark'}
                />,
              ]);
            });
          }}
        />
        <Button
          label="Remove end"
          onPress={() => {
            setItems(prev => prev.slice(0, -1));
          }}
        />
      </View>
    </View>
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

function FlashIndicatorsTest() {
  const scrollRef = React.useRef<ScrollView>(null);
  return (
    <View style={styles.wrapperView}>
      <Button
        label={'Flash Indicators'}
        onPress={() => {
          scrollRef.current?.flashScrollIndicators();
        }}
      />
      <ScrollView
        style={{flex: 1}}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        ref={scrollRef}>
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
        label={'Scroll outside of the content'}
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
              label={'Add one more item'}
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

const ITEM_HEIGHT = 50;

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

function ScrollViewComparator({
  scrollViewLength,
  commonProps,
  lhsProps,
  rhsProps,
}: {
  scrollViewLength: number;
  commonProps: ScrollViewProps;
  lhsProps: ScrollViewProps;
  rhsProps: ScrollViewProps;
}) {
  return (
    <View style={{width: '100%'}}>
      <View
        style={{flexDirection: 'row', width: '100%', alignItems: 'flex-end'}}>
        <View style={{flex: 1}}>
          <Text style={{fontSize: 12}}>{JSON.stringify(lhsProps)}</Text>
          <View style={{height: scrollViewLength}}>
            <ScrollView
              style={{flex: 1, height: scrollViewLength}}
              {...{...commonProps, ...lhsProps}}
            />
          </View>
        </View>
        <View style={{width: 4, height: '100%', backgroundColor: 'gray'}} />
        <View style={{flex: 1}}>
          <Text style={{fontSize: 12}}>{JSON.stringify(rhsProps)}</Text>
          <View style={{height: scrollViewLength}}>
            <ScrollView {...{...commonProps, ...rhsProps}} style={{flex: 1}} />
          </View>
        </View>
      </View>
    </View>
  );
}

function ScrollViewEndFillColorTest() {
  return (
    <View
      style={{
        backgroundColor: 'pink',
        width: '100%',
        justifyContent: 'center',
      }}>
      <View
        style={{
          height: 400,
          marginTop: 50,
          marginBottom: 50,
        }}>
        <ScrollView endFillColor={'yellow'}>
          <View
            style={{
              height: 100,
              borderWidth: 1,
              borderColor: '#000',
              padding: 10,
            }}>
            <Text>Content smaller than scroll view</Text>
          </View>
        </ScrollView>
      </View>
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
