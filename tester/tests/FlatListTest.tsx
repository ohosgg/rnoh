import React from 'react';
import {View, FlatList, StyleSheet, Text} from 'react-native';
import {TestCase, TestSuite} from '../components';

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

export const FlatListTestSuite = () => {
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

export default FlatListTestSuite;
