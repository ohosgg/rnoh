import React from 'react';
import {StyleSheet, Text, View, SectionList} from 'react-native';

const DATA = [
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

export const StickyHeadersExample = () => (
  <SectionList
    sections={DATA}
    keyExtractor={(item, index) => item + index}
    renderItem={({item}) => (
      <View style={styles.item}>
        <Text style={styles.title}>{item}</Text>
      </View>
    )}
    renderSectionHeader={({section: {title}}) => (
      <Text style={styles.header}>{title}</Text>
    )}
    stickySectionHeadersEnabled
  />
);

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
  },
  header: {
    fontSize: 32,
    backgroundColor: '#fff',
    height: 164,
  },
  title: {
    fontSize: 24,
  },
});
