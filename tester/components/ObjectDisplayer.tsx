import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

export function ObjectDisplayer(props: {
  renderContent: (setObject: (obj: Object) => void) => any;
}) {
  const [object, setObject] = useState<Object>();

  return (
    <View style={{ width: 256, height: '70%' }}>
      <Text
        style={{ width: 256, height: 128, fontSize: 8, backgroundColor: '#EEE' }}>
        {typeof object === undefined ? 'undefined' : JSON.stringify(object)}
      </Text>
      {props.renderContent(setObject)}
    </View>
  );
}
