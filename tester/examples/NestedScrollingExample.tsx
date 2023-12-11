import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  VirtualizedList,
} from 'react-native';

export const NestedScrollingExample = () => {
  return (
    <ScrollView style={{backgroundColor: 'yellow'}} bounces>
      <View style={styles.view1} />
      <View style={styles.view2} />
      <View style={styles.view1} />
      <VirtualizedList
        style={{height: 400, backgroundColor: 'green', width: '50%'}}
        data={GENERATED_DATA}
        bounces
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
      <View style={styles.view1} />
      <View style={styles.view2} />
    </ScrollView>
  );
};

const GENERATED_DATA = Array.from({length: 100}, (_, index) => ({
  id: String(index),
  title: `Item ${index + 1}`,
}));
type ItemData = {
  id: string;
  title: string;
};

const Item = ({title}: {title: string}) => (
  <View style={{height: 48, padding: 16, borderBottomWidth: 1}}>
    <Text style={{width: '100%', height: 24}}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  view1: {
    width: '100%',
    height: 300,
    backgroundColor: 'red',
  },
  view2: {
    width: '100%',
    height: 300,
    backgroundColor: 'blue',
  },
});
