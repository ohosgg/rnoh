import {Text, TouchableHighlight} from 'react-native';

export function Button({label, onPress}: {onPress: () => void; label: string}) {
  return (
    <TouchableHighlight
      underlayColor="hsl(210, 80%, 35%)"
      style={{
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: 'hsl(210, 80%, 50%)',
        borderWidth: 2,
        borderColor: 'hsl(210, 50%, 35%)',
      }}
      onPress={onPress}>
      <Text style={{color: 'white', fontWeight: 'bold', fontSize: 12}}>
        {label}
      </Text>
    </TouchableHighlight>
  );
}
