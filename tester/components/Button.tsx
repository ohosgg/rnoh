import {View, Text} from 'react-native';

export function Button({label, onPress}: {onPress: () => void; label: string}) {
  return (
    <View
      style={{
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 24,
        alignSelf: 'flex-start',
        backgroundColor: 'hsl(190, 80%, 70%)',
        borderWidth: 2,
        borderColor: 'hsl(190, 50%, 50%)',
      }}
      onTouchEnd={onPress}>
      <Text style={{height: 16}}>{label}</Text>
    </View>
  );
}
