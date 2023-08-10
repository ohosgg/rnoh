import React from 'react';
import {View, FlatList, StyleSheet, Text} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';
import {Modal} from '../components';

const DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Item',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Item',
  },
];

type ItemProps = {title: string};

const Item = ({title}: ItemProps) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
  </View>
);

export const FlatListTest = () => {
  return (
    <TestSuite name="FlatList">
      <TestCase itShould="display items in the FlatList">
        <View style={styles.container}>
          <FlatList
            data={DATA}
            renderItem={({item}) => <Item title={item.title} />}
            keyExtractor={item => item.id}
          />
        </View>
      </TestCase>
      <TestCase itShould="support sticky headers">
        <Modal>
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
        </Modal>
      </TestCase>
    </TestSuite>
  );
};

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
