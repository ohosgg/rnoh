import React from 'react';
import {Text, View, VirtualizedList} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';

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
    </TestSuite>
  );
}
