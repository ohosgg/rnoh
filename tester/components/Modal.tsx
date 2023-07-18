import {Portal} from '@gorhom/portal';
import {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button} from '../components';

export function Modal(props: {children: any}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen)
    return (
      <Button
        onPress={() => {
          setIsOpen(true);
        }}
        label="Show"
      />
    );
  return (
    <Portal hostName="ModalHost">
      <View
        onTouchEnd={e => {
          setIsOpen(false);
        }}
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: `rgba(0,0,0,0.3)`,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}>
        <View
          style={{backgroundColor: 'white', padding: 16}}
          onTouchEnd={e => e.stopPropagation()}>
          {props.children}
        </View>
      </View>
    </Portal>
  );
}
