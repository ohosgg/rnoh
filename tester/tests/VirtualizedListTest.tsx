import React, {useRef, useState} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  ViewabilityConfig,
  VirtualizedList,
} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';
import {Button} from '../components';

type OnScrollToIndexFailed = {
  index: number;
  highestMeasuredFrameIndex: number;
  averageItemLength: number;
};

type ItemData = {
  id: string;
  title: string;
};

const getItem = (_data: unknown, index: number): ItemData => ({
  id: index.toString(),
  title: `Item ${index + 1}`,
});

const getItemCountVirtualized = (_data: unknown): number => 50;

const Item = ({title}: {title: string}) => (
  <View style={{height: 48, padding: 16, borderBottomWidth: 1}}>
    <Text style={{width: '100%', height: 24}}>{title}</Text>
  </View>
);

export function VirtualizedListTest() {
  return (
    <TestSuite name="VirtualizedList">
      <TestCase itShould="display list of 3 items">
        <VirtualizedList<number[]>
          style={{height: 64}}
          data={[1, 2, 3]}
          getItem={(data, idx) => data[idx]}
          getItemCount={() => 3}
          renderItem={({item}) => (
            <View style={{height: 48, padding: 16}}>
              <Text style={{width: '100%', height: 24}}>{item}</Text>
            </View>
          )}
          keyExtractor={(_, index) => String(index)}
        />
      </TestCase>
      <TestCase
        modal
        itShould="trigger onStartReached event when start of the content is within half the visible length of the list"
        initialState={-1}
        arrange={({setState}) => {
          const data = [1, 2, 3, 4, 5];
          return (
            <VirtualizedList
              data={data}
              getItem={(items: number[], idx: number) => items[idx]}
              getItemCount={() => data.length}
              renderItem={({item}: {item: number}) => (
                <View style={{height: 100, padding: 16, borderWidth: 1}}>
                  <Text style={{width: '100%', height: 24}}>{item}</Text>
                </View>
              )}
              style={{height: 200}}
              onStartReachedThreshold={0.5}
              onStartReached={({
                distanceFromStart,
              }: {
                distanceFromStart: number;
              }) => {
                setState(distanceFromStart);
              }}
            />
          );
        }}
        assert={({state, expect}) => {
          expect(state).to.be.lessThanOrEqual(100);
        }}
      />
      <TestCase
        modal
        itShould="display event sent to by onScrollToIndexFailed when pressing the button before scrolling"
        initialState={undefined}
        arrange={({state, setState}) => {
          return (
            <VirtualizedListOnScrollToIndexFailed
              state={state}
              setState={setState}
            />
          );
        }}
        assert={({state, expect}) => {
          expect(state).to.be.not.undefined;
          expect(state).to.have.all.keys([
            'index',
            'highestMeasuredFrameIndex',
            'averageItemLength',
          ]);
        }}
      />
      <TestCase modal itShould="invert the list">
        <InvertedVirtualizedListTest />
      </TestCase>
      <TestCase modal itShould="start at the 81st item">
        <InitialScrollIndexTest />
      </TestCase>
      <TestSuite name="ref">
        <TestCase
          modal
          itShould="Scroll to the element with the index 10 (Item 11) - scrollToIndex()">
          <VirtualizedListScrollToIndexTest />
        </TestCase>
        <TestCase
          modal
          itShould="Scroll to the specific element (Item 3) - scrollToItem()">
          <VirtualizedListScrollToItemTest />
        </TestCase>
        <TestCase
          modal
          itShould="Scroll to the end of the list - scrollToEnd()"
          initialState={false}
          arrange={({state, setState}) => {
            return (
              <VirtualizedListGetScrollToEnd
                state={state}
                setState={setState}
              />
            );
          }}
          assert={({state, expect}) => {
            expect(state).to.be.true;
          }}
        />
        <TestCase
          modal
          itShould="Get the node number - getScrollableNode()"
          initialState={undefined}
          arrange={({state, setState}) => {
            return (
              <VirtualizedListGetScrollableNode
                state={state}
                setState={setState}
              />
            );
          }}
          assert={({state, expect}) => {
            expect(state).to.be.not.undefined;
            expect(state).to.be.an('number');
          }}
        />

        <TestCase
          modal
          itShould="Get the scroll ref - getScrollRef()"
          initialState={undefined}
          arrange={({state, setState}) => {
            return (
              <VirtualizedListGetScrollRef state={state} setState={setState} />
            );
          }}
          assert={({state, expect}) => {
            expect(state).to.be.not.undefined;
          }}
        />
      </TestSuite>
      <TestCase
        modal
        itShould="Click (call on ref.recordInteraction()) on button before first scroll should trigger onViewableItemsChanged and change the first two items background color to blue"
        initialState={[]}
        arrange={({state, setState}) => {
          return (
            <VirtualizedListRecordInteractionTest
              state={state}
              setState={setState}
            />
          );
        }}
        assert={({state, expect}) => {
          expect(state).to.be.not.empty;
          expect(state).to.be.an('array');
          expect(state).to.have.lengthOf(2);
        }}
      />
      <TestCase
        modal
        itShould="Slightly scroll should make the item that is visible in its entirety (100% of item is visible) - change background color to blue and top and bottom items (if visibile in more than or equal 20%) change background color to lightblue"
        initialState={
          {
            firstThreshold: [],
            secondThreshold: [],
          } as IViewabilityConfigCallbackState
        }
        arrange={({state, setState}) => {
          return (
            <VirtualizedListTestViewabiliyConfigCallbackPairs
              state={state}
              setState={setState}
            />
          );
        }}
        assert={({state, expect}) => {
          expect(state).to.be.an('object');
          expect(state).to.have.all.keys('firstThreshold', 'secondThreshold');
          expect(state.firstThreshold).to.be.an('array').that.has.lengthOf(1);
          expect(state.secondThreshold).to.be.an('array').that.has.lengthOf(3);
        }}
      />
      <TestCase
        modal
        itShould="Slightly scroll should make items (visible in its entirety) to change background color to blue after 2 seconds"
        initialState={[]}
        arrange={({state, setState}) => {
          return (
            <VirtualizedListViewabilityConfigViewTime
              state={state}
              setState={setState}
            />
          );
        }}
        assert={({state, expect}) => {
          expect(state).to.be.not.empty;
          expect(state).to.be.an('array');
          expect(state).to.have.lengthOf(2);
        }}
      />
    </TestSuite>
  );
}

function VirtualizedListOnScrollToIndexFailed({
  state,
  setState,
}: {
  state: OnScrollToIndexFailed | undefined;
  setState: (state: any) => void;
}) {
  const ref = useRef<VirtualizedList<ItemData>>(null);

  const handleOnPress = () => {
    if (ref.current) {
      ref.current.scrollToIndex({index: 20, animated: true});
    }
  };

  return (
    <>
      <Button label="Scroll to NOT_EXISTING index" onPress={handleOnPress} />
      <View style={{height: 50, backgroundColor: 'lightblue'}}>
        <Text>{state ? JSON.stringify(state) : ''}</Text>
      </View>
      <VirtualizedList
        initialNumToRender={5}
        windowSize={5}
        ref={ref}
        style={{height: 128}}
        getItem={getItem}
        getItemCount={getItemCountVirtualized}
        renderItem={({item}: {item: ItemData}) => <Item title={item.title} />}
        keyExtractor={(item: ItemData) => item.id}
        onScrollToIndexFailed={(failInfo: OnScrollToIndexFailed) => {
          // @ts-ignore
          setState(failInfo);
        }}
      />
    </>
  );
}

const GENERATED_DATA = Array.from({length: 100}, (_, index) => ({
  id: String(index),
  title: `Item ${index + 1}`,
}));

function VirtualizedListScrollToIndexTest() {
  const ref = useRef<VirtualizedList<ItemData>>(null);

  const handleOnPress = () => {
    if (ref.current) {
      ref.current?.scrollToIndex({index: 10, animated: true});
    }
  };

  return (
    <>
      <Button label="Scroll to index = 10" onPress={handleOnPress} />
      <VirtualizedList
        ref={ref}
        style={{height: 128}}
        getItem={(_, index: number) => GENERATED_DATA[index]}
        getItemCount={() => GENERATED_DATA.length}
        renderItem={({item}: {item: ItemData}) => <Item title={item.title} />}
        keyExtractor={(item: ItemData) => item.id}
      />
    </>
  );
}

function VirtualizedListScrollToItemTest() {
  const ref = useRef<VirtualizedList<ItemData>>(null);

  const handleOnPress = () => {
    if (ref.current) {
      ref.current.scrollToItem({item: GENERATED_DATA[2], animated: true});
    }
  };

  return (
    <>
      <Button label="Scroll to item = 3" onPress={handleOnPress} />
      <VirtualizedList
        ref={ref}
        style={{height: 256}}
        data={GENERATED_DATA}
        getItem={(_, index: number) => GENERATED_DATA[index]}
        getItemCount={() => GENERATED_DATA.length}
        getItemLayout={(_, index: number) => ({
          length: 48,
          offset: 48 * index,
          index,
        })}
        renderItem={({item}: {item: ItemData}) => <Item title={item.title} />}
        keyExtractor={(item: ItemData) => item.id}
      />
    </>
  );
}

function InvertedVirtualizedListTest() {
  return (
    <VirtualizedList
      style={{height: 256}}
      data={GENERATED_DATA}
      getItem={(_, index: number) => GENERATED_DATA[index]}
      getItemCount={() => GENERATED_DATA.length}
      getItemLayout={(_, index: number) => ({
        length: 48,
        offset: 48 * index,
        index,
      })}
      inverted
      renderItem={({item}: {item: ItemData}) => (
        <TouchableOpacity onPress={() => console.log(item.title)}>
          <Item title={item.title} />
        </TouchableOpacity>
      )}
      keyExtractor={(item: ItemData) => item.id}
    />
  );
}

function InitialScrollIndexTest() {
  return (
    <VirtualizedList
      style={{height: 256}}
      data={GENERATED_DATA}
      getItem={(_, index: number) => GENERATED_DATA[index]}
      getItemCount={() => GENERATED_DATA.length}
      getItemLayout={(_, index: number) => ({
        length: 48,
        offset: 48 * index,
        index,
      })}
      initialScrollIndex={80}
      renderItem={({item}: {item: ItemData}) => <Item title={item.title} />}
      keyExtractor={(item: ItemData) => item.id}
    />
  );
}

function VirtualizedListGetScrollableNode({
  state,
  setState,
}: {
  state: number | undefined;
  setState: (state: any) => void;
}) {
  const ref = useRef<VirtualizedList<ItemData>>(null);

  const handleOnPress = () => {
    if (ref.current) {
      // @ts-ignore - getScrollableNode() is not in the type definition
      // in react-native repository but it is in the documentation
      const node = ref.current.getScrollableNode();
      setState(node);
    }
  };

  return (
    <>
      <Button label="Get ScrollableNode" onPress={handleOnPress} />
      <View style={{height: 50, backgroundColor: 'lightblue'}}>
        <Text>{`ScrollableNode = ${state}`}</Text>
      </View>
      <VirtualizedList
        ref={ref}
        style={{height: 128}}
        getItem={getItem}
        getItemCount={getItemCountVirtualized}
        renderItem={({item}: {item: ItemData}) => <Item title={item.title} />}
        keyExtractor={(item: ItemData) => item.id}
      />
    </>
  );
}

function VirtualizedListGetScrollRef({
  state,
  setState,
}: {
  state: boolean | undefined;
  setState: (state: any) => void;
}) {
  const ref = useRef<VirtualizedList<ItemData>>(null);

  const handleOnPress = () => {
    if (ref.current) {
      const scrollRef = ref.current.getScrollRef();
      setState(Boolean(scrollRef));
    }
  };
  return (
    <>
      <Button label="Get ScrollRef" onPress={handleOnPress} />
      <View style={{height: 50, backgroundColor: 'lightblue'}}>
        <Text>{`ScrollRef is defined: ${state}`}</Text>
      </View>
      <VirtualizedList
        ref={ref}
        style={{height: 128}}
        getItem={getItem}
        getItemCount={getItemCountVirtualized}
        renderItem={({item}: {item: ItemData}) => <Item title={item.title} />}
        keyExtractor={(item: ItemData) => item.id}
      />
    </>
  );
}

function VirtualizedListGetScrollToEnd({
  state,
  setState,
}: {
  state: boolean | undefined;
  setState: (state: any) => void;
}) {
  const ref = useRef<VirtualizedList<ItemData>>(null);

  const handleOnPress = () => {
    if (ref.current) {
      ref.current.scrollToEnd({animated: true});
    }
  };
  return (
    <>
      <Button label="Scroll to the end" onPress={handleOnPress} />
      <View style={{height: 50, backgroundColor: 'lightblue'}}>
        <Text>{`End is reached: ${state}`}</Text>
      </View>
      <VirtualizedList
        ref={ref}
        style={{height: 128}}
        getItem={getItem}
        getItemCount={getItemCountVirtualized}
        renderItem={({item}: {item: ItemData}) => <Item title={item.title} />}
        keyExtractor={(item: ItemData) => item.id}
        onEndReached={() => setState(true)}
      />
    </>
  );
}

export interface ViewToken<TItem> {
  item: TItem;
  key: string;
  index: number | null;
  isViewable: boolean;
  section?: any | undefined;
}

type OnViewableItemsChangedType<TItem> = {
  viewableItems: Array<ViewToken<TItem>>;
  changed: Array<ViewToken<TItem>>;
};

const deafultViewabilityConfig: ViewabilityConfig = {
  // Nothing is considered viewable until the user scrolls or `recordInteraction`
  // is called after render.
  waitForInteraction: true,

  // minimum amount of time (in milliseconds) that an item must be physically viewable
  // before the viewability callback will be fired
  minimumViewTime: 100,

  // viewAreaCoveragePercentThreshold: 100,
  itemVisiblePercentThreshold: 70,
};

const MockedVideoPlayer = ({
  itemId,
  height,
  playMockVideo,
  prefetchMockVideo,
}: {
  height?: number;
  itemId: string | number;
  playMockVideo: boolean;
  prefetchMockVideo?: boolean;
}) => {
  const backgroundPlayingColor = playMockVideo ? 'blue' : 'lightgray';
  const backgroundPrefetchingColor = prefetchMockVideo
    ? 'lightblue'
    : 'lightgray';

  return (
    <View
      style={{
        height: height ?? 200,
        backgroundColor: playMockVideo
          ? backgroundPlayingColor
          : backgroundPrefetchingColor,
        borderWidth: 2,
        marginBottom: 5,
        justifyContent: 'center',
      }}>
      <Text style={{textAlign: 'center'}}>Item with id: {itemId}</Text>
      <Text style={{textAlign: 'center'}}>Mocked Video Player</Text>
      <Text style={{textAlign: 'center'}}>
        {playMockVideo
          ? 'Playing'
          : prefetchMockVideo
          ? 'Prefetching...'
          : 'Waiting to be visible'}
      </Text>
    </View>
  );
};

function VirtualizedListRecordInteractionTest({
  state,
  setState,
}: {
  state: string[];
  setState: (state: any) => void;
}) {
  const [visibleItems, setVisibleItems] = useState<string[]>(state);

  const ref = useRef<VirtualizedList<ItemData>>(null);

  const handleOnPress = () => {
    if (ref.current) {
      ref.current.recordInteraction();
    }
  };

  const onViewableItemsChanged = ({
    viewableItems,
  }: OnViewableItemsChangedType<ItemData>) => {
    const newVisibleItems = viewableItems.map(
      viewableItem => viewableItem.item.id,
    );
    setVisibleItems(newVisibleItems);
    setState(newVisibleItems);
  };

  return (
    <View style={{height: 600}}>
      <View style={{marginBottom: 10}}>
        <Button label="Record interaction" onPress={handleOnPress} />
        <Text style={{padding: 10}}>
          Visible Items are: {JSON.stringify(visibleItems)}
        </Text>
      </View>
      <VirtualizedList
        ref={ref}
        style={{height: 128}}
        getItem={getItem}
        getItemCount={getItemCountVirtualized}
        renderItem={({item}: {item: ItemData}) => (
          <MockedVideoPlayer
            itemId={item.id}
            // yea, not sure about this casting either
            playMockVideo={visibleItems.includes(item.id as never)}
          />
        )}
        keyExtractor={(item: ItemData) => item.id}
        viewabilityConfig={deafultViewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
      />
    </View>
  );
}

const firstViewabilityConfig: ViewabilityConfig = {
  waitForInteraction: true,
  minimumViewTime: 100,
  itemVisiblePercentThreshold: 100,
};

const secondViewabilityConfig: ViewabilityConfig = {
  waitForInteraction: true,
  minimumViewTime: 100,
  itemVisiblePercentThreshold: 20,
};

interface IViewabilityConfigCallbackState {
  firstThreshold: string[];
  secondThreshold: string[];
}

function VirtualizedListTestViewabiliyConfigCallbackPairs({
  state = {firstThreshold: [], secondThreshold: []},
  setState,
}: {
  state: IViewabilityConfigCallbackState;
  setState: React.Dispatch<
    React.SetStateAction<IViewabilityConfigCallbackState>
  >;
}) {
  const [firstVisibleItems, setFirstVisibleItems] = useState<string[]>(
    state.firstThreshold,
  );
  const [secondVisibleItems, setSecondVisibleItems] = useState<string[]>(
    state.secondThreshold,
  );

  const viewabilityConfigCallbackPairs = [
    {
      viewabilityConfig: firstViewabilityConfig,
      onViewableItemsChanged: ({
        viewableItems,
      }: OnViewableItemsChangedType<ItemData>) => {
        const newFirstVisibleItems = viewableItems.map(
          viewableItem => viewableItem.item.id,
        );
        setFirstVisibleItems(newFirstVisibleItems);
        setState(prevState => ({
          ...prevState,
          firstThreshold: newFirstVisibleItems,
        }));
      },
    },
    {
      viewabilityConfig: secondViewabilityConfig,
      onViewableItemsChanged: ({
        viewableItems,
      }: OnViewableItemsChangedType<ItemData>) => {
        const newSecondVisibleItems = viewableItems.map(
          viewableItem => viewableItem.item.id,
        );
        setSecondVisibleItems(newSecondVisibleItems);
        setState(prevState => ({
          ...prevState,
          secondThreshold: newSecondVisibleItems,
        }));
      },
    },
  ];

  return (
    <View style={{height: 600}}>
      <View style={{marginBottom: 10}}>
        <Text>
          First threshold {firstViewabilityConfig.itemVisiblePercentThreshold}%{' '}
          visible items are: {JSON.stringify(firstVisibleItems)}
        </Text>
        <Text>
          second threshold {secondViewabilityConfig.itemVisiblePercentThreshold}
          % visible items are: {JSON.stringify(secondVisibleItems)}
        </Text>
      </View>
      <VirtualizedList
        style={{height: 128}}
        getItem={getItem}
        getItemCount={getItemCountVirtualized}
        renderItem={({item}: {item: ItemData}) => (
          <MockedVideoPlayer
            height={300}
            itemId={item.id}
            // yea, not sure about this casting either
            playMockVideo={firstVisibleItems.includes(item.id as never)}
            prefetchMockVideo={secondVisibleItems.includes(item.id as never)}
          />
        )}
        keyExtractor={(item: ItemData) => item.id}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
      />
    </View>
  );
}

const thirdViewabilityConfig: ViewabilityConfig = {
  waitForInteraction: true,
  minimumViewTime: 2000,
  itemVisiblePercentThreshold: 100,
};

function VirtualizedListViewabilityConfigViewTime({
  state,
  setState,
}: {
  state: string[];
  setState: (state: any) => void;
}) {
  const [visibleItems, setVisibleItems] = useState<string[]>(state);

  const onViewableItemsChanged = ({
    viewableItems,
  }: OnViewableItemsChangedType<ItemData>) => {
    const newVisibleItems = viewableItems.map(
      viewableItem => viewableItem.item.id,
    );

    setVisibleItems(newVisibleItems);
    setState(newVisibleItems);
  };

  return (
    <View style={{height: 600}}>
      <View style={{marginBottom: 10}}>
        <Text style={{padding: 10}}>
          Visible Items after {thirdViewabilityConfig.minimumViewTime}ms are:{' '}
          {JSON.stringify(visibleItems)}
        </Text>
      </View>
      <VirtualizedList
        style={{height: 128}}
        getItem={getItem}
        getItemCount={getItemCountVirtualized}
        renderItem={({item}: {item: ItemData}) => (
          <MockedVideoPlayer
            itemId={item.id}
            // yea, not sure about this casting either
            playMockVideo={visibleItems.includes(item.id as never)}
          />
        )}
        keyExtractor={(item: ItemData) => item.id}
        viewabilityConfig={thirdViewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
      />
    </View>
  );
}
