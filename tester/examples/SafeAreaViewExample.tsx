import {useState} from 'react';
import {SafeAreaView, StatusBar, View} from 'react-native';
import {Button} from '../components';

export function SafeAreaViewExample() {
  const [isStatusBarHidden, setIsStatusBarHidden] = useState(false);

  return (
    <>
      <StatusBar hidden={isStatusBarHidden} />
      <SafeAreaView style={{backgroundColor: 'red', flex: 1}}>
        <View style={{backgroundColor: 'green', flex: 1}}>
          <Button
            onPress={() => {
              setIsStatusBarHidden(prev => !prev);
            }}
            label="Toogle Status Bar"
          />
        </View>
      </SafeAreaView>
    </>
  );
}
