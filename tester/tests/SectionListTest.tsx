import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  SectionList,
  StyleSheet,
  Text,
  SectionListProps,
  RefreshControl,
} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';
import {Button, Modal} from '../components';

interface SectionData {
  title: string;
  data: string[];
}

const DATA: SectionData[] = [
  {
    title: 'Main dishes',
    data: ['Pizza', 'Burger', 'Risotto'],
  },
  {
    title: 'Sides',
    data: ['French Fries', 'Onion Rings', 'Fried Shrimps'],
  },
  {
    title: 'Drinks',
    data: ['Water', 'Coke', 'Beer'],
  },
  {
    title: 'Desserts',
    data: ['Cheese Cake', 'Ice Cream'],
  },
];

const commonProps = {
  style: {width: 256},
  sections: DATA,
  keyExtractor: (item, index) => item + index,
  renderSectionHeader: ({section}) => (
    <Text style={styles.title}>{section.title}</Text>
  ),
  renderItem: ({item}) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item}</Text>
    </View>
  ),
} satisfies SectionListProps<any>;

export const SectionListTest = () => {
  return (
    <TestSuite name="SectionList">
      <TestCase itShould="display items in the SectionList">
        <Modal>
          <View style={styles.container}>
            <SectionList
              sections={DATA}
              keyExtractor={(item, index) => item + index}
              renderItem={({item}) => (
                <View style={styles.item}>
                  <Text style={styles.title}>{item}</Text>
                </View>
              )}
              renderSectionHeader={({section: {title}}) => (
                <Text style={styles.title}>{title}</Text>
              )}
            />
          </View>
        </Modal>
      </TestCase>
      <TestCase itShould="display an array of visible items">
        <Modal>
          <ObjectDisplayer
            renderContent={setObject => {
              return (
                <SectionList
                  {...commonProps}
                  viewabilityConfig={{viewAreaCoveragePercentThreshold: 100}}
                  onViewableItemsChanged={item => {
                    setObject(item.viewableItems.map(i => i.item));
                  }}
                />
              );
            }}
          />
        </Modal>
      </TestCase>
      <TestCase itShould="render no more than 2 new items per batch when scrolling down">
        <Modal>
          <SectionList
            {...commonProps}
            windowSize={2}
            renderItem={({item}) => {
              return (
                <DelayedDisplayer
                  delayInMs={1000}
                  renderContent={() => {
                    return (
                      <View style={styles.item}>
                        <Text style={styles.title}>{item}</Text>
                      </View>
                    );
                  }}
                />
              );
            }}
          />
        </Modal>
      </TestCase>
      <TestCase itShould="display nativeEvent when onMomentumScrollBegin">
        <Modal>
          <ObjectDisplayer
            renderContent={setObject => {
              return (
                <SectionList
                  {...commonProps}
                  onMomentumScrollBegin={e => {
                    setObject({nativeEvent: e.nativeEvent});
                  }}
                />
              );
            }}
          />
        </Modal>
      </TestCase>
      <TestCase itShould="display nativeEvent when onMomentumScrollEnd">
        <Modal>
          <ObjectDisplayer
            renderContent={setObject => {
              return (
                <SectionList
                  {...commonProps}
                  onMomentumScrollEnd={e => {
                    setObject({nativeEvent: e.nativeEvent});
                  }}
                />
              );
            }}
          />
        </Modal>
      </TestCase>
      <TestCase itShould="display event sent to by onScrollToIndexFailed when pressing the button before scrolling">
        <Modal>
          <ScrollToIndexFailureTestCase />
        </Modal>
      </TestCase>
      {/* sticky headers seems to work on Android when App.tsx was replaced with content of this test */}
      <TestCase itShould="[Fails on Android, Crashes Harmony] make headers sticky">
        <Modal>
          <SectionList {...commonProps} stickySectionHeadersEnabled />
        </Modal>
      </TestCase>
      <TestCase itShould="support viewOffset when scrolling to location">
        <Modal>
          <ScrollToLocationOffset />
        </Modal>
      </TestCase>
      <TestCase itShould="[FAILS] show vertical scroll indicator">
        <Modal>
          <SectionList {...commonProps} showsVerticalScrollIndicator={true} />
        </Modal>
      </TestCase>
      <TestCase itShould="hide vertical scroll indicator">
        <Modal>
          <SectionList {...commonProps} showsVerticalScrollIndicator={false} />
        </Modal>
      </TestCase>
      <TestCase itShould="hide horizontal scroll indicator">
        <Modal>
          <View style={{width: 200, height: '100%'}}>
            <SectionList
              {...commonProps}
              showsHorizontalScrollIndicator={false}
              horizontal
            />
          </View>
        </Modal>
      </TestCase>
      <TestCase itShould="[SKIP] display overscroll effect">
        <Modal>
          {/* On Android this settings enables stretching the ScrollView content. On Harmony `bounces` prop can be used instead. */}
          <SectionList {...commonProps} overScrollMode="always" />
        </Modal>
      </TestCase>
      <TestCase itShould="[FAILS] render custom RefreshControl on pull to refresh">
        <Modal>
          <ObjectDisplayer
            renderContent={setObject => {
              return (
                <SectionList
                  {...commonProps}
                  refreshControl={
                    // only RefreshControl can be provided
                    <RefreshControl
                      onRefresh={() => {
                        setObject({onRefreshCalled: true});
                      }}
                      refreshing={false}
                      colors={['red', 'green']}
                    />
                  }
                />
              );
            }}
          />
        </Modal>
      </TestCase>
      <TestCase itShould="[FAILS] render standard RefreshControl on pull to refresh">
        <Modal>
          <ObjectDisplayer
            renderContent={setObject => {
              return (
                <SectionList
                  {...commonProps}
                  onRefresh={() => {
                    setObject({onRefreshCalled: true});
                  }}
                  refreshing={false}
                />
              );
            }}
          />
        </Modal>
      </TestCase>
      <TestCase itShould="[FAILS on Android/Harmony] display onScroll native event throttled every second">
        {/* https://github.com/facebook/react-native/issues/18441 */}
        <Modal>
          <ObjectDisplayer
            renderContent={setObject => {
              return (
                <SectionList
                  {...commonProps}
                  scrollEventThrottle={1000}
                  onScroll={e => {
                    setObject(e.nativeEvent);
                  }}
                />
              );
            }}
          />
        </Modal>
      </TestCase>
      <TestCase itShould="allow scrolling beneath the content due to large lengths returned in getItemLayout">
        <Modal>
          <SectionList
            {...commonProps}
            getItemLayout={(data, index) => {
              const ITEM_HEIGHT = 1000;
              return {
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              };
            }}
          />
        </Modal>
      </TestCase>
      <TestCase itShould="display onEndReached event when scroll reached bottom">
        <Modal>
          <ObjectDisplayer
            renderContent={setObject => {
              return (
                <SectionList
                  {...commonProps}
                  onEndReached={e => {
                    setObject(e);
                  }}
                />
              );
            }}
          />
        </Modal>
      </TestCase>
    </TestSuite>
  );
};

function ScrollToIndexFailureTestCase() {
  const ref = useRef<SectionList>(null);

  return (
    <>
      <Button
        label="Scroll to index"
        onPress={() => {
          if (ref.current) {
            ref.current.scrollToLocation({
              sectionIndex: 1,
              itemIndex: 10,
              animated: true,
            });
          }
        }}
      />
      <ObjectDisplayer
        renderContent={setObject => {
          return (
            <SectionList
              ref={ref}
              {...commonProps}
              windowSize={1}
              onScrollToIndexFailed={info => {
                setObject(info);
              }}
            />
          );
        }}
      />
    </>
  );
}

function ScrollToLocationOffset() {
  const ref = useRef<SectionList>(null);

  return (
    <>
      <Button
        label="Scroll to onion rings"
        onPress={() => {
          ref.current?.scrollToLocation({
            itemIndex: 1,
            sectionIndex: 1,
            viewOffset: -100,
          });
        }}
      />
      <SectionList ref={ref} {...commonProps} />
    </>
  );
}

function DelayedDisplayer(props: {
  renderContent: () => any;
  delayInMs: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, props.delayInMs);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return <>{isVisible ? props.renderContent() : null}</>;
}

function ObjectDisplayer(props: {
  renderContent: (setObject: (obj: Object) => void) => any;
}) {
  const [object, setObject] = useState<Object>();

  return (
    <View style={{width: 256, height: '100%'}}>
      <Text
        style={{width: 256, height: 128, fontSize: 8, backgroundColor: '#EEE'}}>
        {typeof object === undefined ? 'undefined' : JSON.stringify(object)}
      </Text>
      {props.renderContent(setObject)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
    height: 40,
  },
});

export default SectionListTest;
