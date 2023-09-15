import {FlatList, RefreshControl, ScrollView, Text} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';
import {useEffect, useState} from 'react';

export const RefreshControlTest = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setInterval(() => setRefreshKey(prev => prev + 1), 1000);
  }, []);

  return (
    <TestSuite name="RefreshControl">
      <TestCase itShould="display refresh control every second">
        <ScrollView
          style={{height: 128, backgroundColor: 'white'}}
          refreshControl={
            <RefreshControl
              refreshing={refreshKey % 2 === 0}
              onRefresh={() => {}}
            />
          }
        />
      </TestCase>
      <TestCase
        modal
        itShould="be refreshing for one second after pull to refresh">
        <PullToRefreshExample />
      </TestCase>
      <TestCase
        modal
        itShould="immediately stop refreshing after pulling to refresh">
        <PullToRefreshExample doNothingOnRefresh />
      </TestCase>
    </TestSuite>
  );
};

function PullToRefreshExample({
  doNothingOnRefresh,
}: {
  doNothingOnRefresh?: boolean;
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <FlatList
      style={{height: 256}}
      refreshing={isRefreshing}
      onRefresh={() => {
        if (!doNothingOnRefresh) {
          setIsRefreshing(true);
          setTimeout(() => setIsRefreshing(false), 1000);
        }
      }}
      data={[1, 2, 3, 4, 5]}
      renderItem={({item}) => (
        <Text style={{height: 96, borderBottomWidth: 1}}>{item}</Text>
      )}
    />
  );
}
