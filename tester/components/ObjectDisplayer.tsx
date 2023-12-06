import {useState} from 'react';
import {Text, View} from 'react-native';

export function ObjectDisplayer(props: {
  renderContent: (setObject: (obj: Object) => void) => any;
}) {
  const [object, setObject] = useState<Object>();

  return (
    <View style={{width: '100%'}}>
      <Text
        style={{
          width: '100%',
          height: 128,
          fontSize: 8,
          backgroundColor: '#EEE',
        }}>
        {object === undefined ? 'undefined' : JSON.stringify(object)}
      </Text>
      {props.renderContent(setObject)}
    </View>
  );
}
