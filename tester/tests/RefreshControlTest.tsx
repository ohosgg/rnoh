import {FlatList, RefreshControl, ScrollView, Text, View} from 'react-native';
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
      <TestCase itShould="display refresh control with tintColor">
        <ScrollView
          style={{height: 128, backgroundColor: 'white'}}
          refreshControl={
            <RefreshControl
              refreshing={refreshKey % 2 === 0}
              tintColor={'#FFC0CB'}
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
      <TestCase
        modal
        itShould="refresh with progressViewOffset = undefined"
        skip // there is a restriction on how tall the progress view can be - should be removed in API 11 https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/624
      >
        <PullToRefreshProgressViewOffset />
      </TestCase>
      <TestCase
        modal
        itShould="refresh with progressViewOffset = 50"
        skip // there is a restriction on how tall the progress view can be - should be removed in API 11 https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/624
      >
        <PullToRefreshProgressViewOffset progressViewOffset={50} />
      </TestCase>
      <TestCase
        modal
        itShould="refresh with progressViewOffset = 100"
        skip // there is a restriction on how tall the progress view can be - should be removed in API 11 https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/624
      >
        <PullToRefreshProgressViewOffset progressViewOffset={100} />
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

function PullToRefreshProgressViewOffset({
  progressViewOffset,
}: {
  progressViewOffset?: number;
}) {
  const [refreshing, setIsRefreshing] = useState(false);

  return (
    <ScrollView
      style={{height: '90%', backgroundColor: 'lightgray'}}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setIsRefreshing(true);
            setTimeout(() => setIsRefreshing(false), 3000);
          }}
          progressViewOffset={progressViewOffset}
        />
      }>
      <View style={{height: 50, backgroundColor: 'lightblue'}}>
        <Text>First Content Component</Text>
      </View>
      <View style={{height: 50, backgroundColor: 'lightgreen'}}>
        <Text>Second Content Component</Text>
      </View>
      <View style={{height: 50, backgroundColor: 'lightblue'}}>
        <Text>Third Content Component</Text>
      </View>
    </ScrollView>
  );
}
