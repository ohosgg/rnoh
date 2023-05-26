import React from 'react';
import {View, SectionList, StyleSheet, Text} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';

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

export const SectionListTest = () => {
  return (
    <TestSuite name="SectionList">
      <TestCase itShould="display items in the SectionList">
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
  header: {
    fontSize: 32,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    height: 40,
    width: '100%',
  },
});

export default SectionListTest;
