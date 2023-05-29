import {RefreshControl, ScrollView} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';

export const RefreshControlTest = () => {
  return (
    <TestSuite name="RefreshControl">
      <TestCase itShould="display refresh control">
        <ScrollView
          style={{height: 84, backgroundColor: 'silver'}}
          refreshControl={
            <RefreshControl refreshing={true} onRefresh={() => {}} />
          }></ScrollView>
      </TestCase>
    </TestSuite>
  );
};
