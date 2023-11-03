import React, { useCallback, useRef, useState } from 'react';
import { View, FlatList, StyleSheet, Text, FlatListProps, TouchableOpacity, ViewToken } from 'react-native';
import { TestCase, TestSuite } from '@rnoh/testerino';
import { Button, ObjectDisplayer } from '../components';
interface ItemData {
  title: string;
  id: string;
}
const DATA: ItemData[] = [
  {
    id: 'gd5jc6gnbb2sbrz9w8z2',
    title: 'First Item',
  },
  {
    id: 'jb95igwbswt13etu073o',
    title: 'Second Item',
  },
  {
    id: 'zcp3zsdkkjmc7cx66hjl',
    title: 'Third Item',
  },
  {
    id: 'fx72rfguehrydmd4n21l',
    title: 'Fourth Item',
  },
  {
    id: '8kadvdlhtr7m3yv3fp4v',
    title: 'Fifth Item',
  },
];

type ItemProps = { title: string };

const Item = ({ title }: ItemProps) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
  </View>
);
const commonProps = {
  style: {
    height: 120,
  },
  data: DATA,
  nestedScrollEnabled: true,
  renderItem: ({ item }) => <Item title={item.title} />,
  keyExtractor: (item) => item.id,
} satisfies FlatListProps<any>;

export const FlatListTest = () => {
  return (
    <TestSuite name="FlatList">
      <TestCase itShould="display items in the FlatList (data, renderItem)">
        <FlatList {...commonProps} />
      </TestCase>
      <TestCase itShould="display items with separator between them in the FlatList">
        <FlatList
          {...commonProps}
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: 2,
                alignSelf: 'center',
                width: '90%',
                backgroundColor: 'black',
              }}
            />
          )}
        />
      </TestCase>
      <TestCase modal itShould="render only the first two items">
        <InitialNumToRenderTestCase />
      </TestCase>
      <TestCase modal itShould="display an array of fully visible items">
        <ObjectDisplayer
          renderContent={setObject => {
            return (
              <View style={{height: 300}}>
                <FlatList
                  {...commonProps}
                  viewabilityConfig={{viewAreaCoveragePercentThreshold: 100}}
                  onViewableItemsChanged={useCallback(
                    (item: {
                      viewableItems: Array<ViewToken>;
                      changed: Array<ViewToken>;
                    }) => {
                      setObject(item.viewableItems.map(i => i.item));
                    },
                    [],
                  )}
                />
              </View>
            );
          }}
        />
      </TestCase>
      <TestCase modal itShould="turn the items red on press (extraData)">
        <ExtraDataTestCase />
      </TestCase>
      <TestCase
        modal
        itShould="the left list should render the added items one by one, while the right list should render almost all at once (maxToRenderPerBatch)">
        <MaxToRenderPerBatchTestCase />
      </TestCase>
      <TestCase itShould="display empty list with a text saying that the list is empty ">
        <View style={{height: 40}}>
          <FlatList
            data={[]}
            nestedScrollEnabled
            renderItem={({item}) => null}
            ListEmptyComponent={
              <Text style={{textAlign: 'center'}}>This list is empty</Text>
            }
          />
        </View>
      </TestCase>
      <TestCase
        skip
        itShould="scroll to the third item at the middle (scrollToIndex)">
        <ScrollToIndexTestCase />
      </TestCase>
      <TestCase itShould="scroll to the third item at the middle (scrollToOffset)">
        <ScrollToOffsetTestCase />
      </TestCase>
      <TestCase modal itShould="scroll to the third item (scrollToItem)">
        <ScrollToItemTestCase />
      </TestCase>
      <TestCase modal itShould="support sticky headers">
        <View style={{height: 100, backgroundColor: '#fff'}}>
          <FlatList
            data={DATA}
            renderItem={({item}) => (
              <View
                style={{
                  padding: 20,
                  borderBottomWidth: 1,
                  borderBottomColor: '#ccc',
                }}>
                <Text style={{fontSize: 16}}>{item.title}</Text>
              </View>
            )}
            keyExtractor={item => item.id}
            ListHeaderComponent={() => (
              <View
                style={{
                  backgroundColor: '#f0f0f0',
                  padding: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                  Sticky Header
                </Text>
              </View>
            )}
            stickyHeaderIndices={[0]} // Make the header sticky
          />
        </View>
      </TestCase>
    </TestSuite>
  );
};
function InitialNumToRenderTestCase() {
  return (
    <View
      style={{
        height: 120,
      }}>
      <FlatList
        style={{
          height: 120,
        }}
        data={DATA}
        nestedScrollEnabled
        renderItem={({item}) => {
          return <Item title={item.title} />;
        }}
        keyExtractor={item => item.id}
        initialNumToRender={2}
        windowSize={1}
      />
    </View>
  );
}

function MaxToRenderPerBatchTestCase() {
  const [data, setData] = useState<string[]>([]);

  const renderItem = ({item, index}: {item: string; index: number}) => {
    return <Text style={{height: 20}}>{item}</Text>;
  };

  return (
    <View style={{height: 500}}>
      <View style={{flexDirection: 'row'}}>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          maxToRenderPerBatch={1}
        />
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          maxToRenderPerBatch={60}
        />
      </View>
      <Button
        label="Add 60 items"
        onPress={() => {
          setData(prevData => [
            ...prevData,
            ...Array.from({length: 60}, (_, i) => `New item ${i + 1}`),
          ]);
        }}
      />
    </View>
  );
}

interface SelectableListItemProps {
  id: string;
  onPressItem: (id: string) => void;
  selected: boolean;
  title: string;
}

class SelectableListItem extends React.PureComponent<SelectableListItemProps> {
  _onPress = () => {
    this.props.onPressItem(this.props.id);
  };

  render() {
    const textColor = this.props.selected ? 'red' : 'black';
    return (
      <TouchableOpacity onPress={this._onPress}>
        <View>
          <Text style={{color: textColor}}>{this.props.title}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

interface MultiSelectListState {
  selected: Map<string, boolean>;
}

class ExtraDataTestCase extends React.PureComponent<{}, MultiSelectListState> {
  state: MultiSelectListState = {
    selected: new Map<string, boolean>(),
  };

  _keyExtractor = (item: ItemData, index: number) => item.id;

  _onPressItem = (id: string) => {
    this.setState(state => {
      const selected = new Map(state.selected);
      selected.set(id, !selected.get(id));
      return {selected};
    });
  };

  _renderItem = ({item}: {item: ItemData}) => (
    <SelectableListItem
      id={item.id}
      onPressItem={this._onPressItem}
      selected={!!this.state.selected.get(item.id)}
      title={item.title}
    />
  );

  render() {
    return (
      <View style={{height: 200}}>
        <FlatList
          data={DATA}
          extraData={this.state}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem}
        />
      </View>
    );
  }
}

function ScrollToIndexTestCase() {
  const flatlistRef = useRef<FlatList>(null);
  const [error, setError] = useState('');
  return (
    <>
      <Button
        label={'Scroll to the 3rd item at the middle'}
        onPress={() => {
          flatlistRef.current?.scrollToIndex({
            animated: true,
            index: 2,
            viewPosition: 0.5,
          });
        }}
      />
      <FlatList
        {...commonProps}
        ref={flatlistRef}
        onScrollToIndexFailed={info => {
          setError('Scroll to index failed ' + JSON.stringify(info));
        }}
      />
      <Text>{error}</Text>
    </>
  );
}
function ScrollToOffsetTestCase() {
  const flatlistRef = useRef<FlatList>(null);

  return (
    <>
      <Button
        label={'Scroll to the 3rd item at top'}
        onPress={() => {
          flatlistRef.current?.scrollToOffset({
            animated: true,
            offset: 200,
          });
        }}
      />
      <FlatList {...commonProps} ref={flatlistRef} />
    </>
  );
}
function ScrollToItemTestCase() {
  const flatlistRef = useRef<FlatList>(null);

  return (
    <>
      <Button
        label={'Scroll to the 3rd item'}
        onPress={() => {
          flatlistRef.current?.scrollToItem({
            animated: true,
            item: DATA[2],
          });
        }}
      />
      <FlatList {...commonProps} ref={flatlistRef} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: '100%',
  },
});

export default FlatListTest;
