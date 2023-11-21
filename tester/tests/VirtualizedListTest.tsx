import React, {useRef, useState} from 'react';
import {ScrollView, Text, View, VirtualizedList} from 'react-native';
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
              getItem={(data: number[], idx: number) => data[idx]}
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
