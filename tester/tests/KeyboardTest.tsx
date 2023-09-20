import {TestSuite, TestCase} from '@rnoh/testerino';
import {Keyboard, StyleSheet, Text, TextInput, View} from 'react-native';
import {Button, ObjectDisplayer} from '../components';
import {useEffect} from 'react';

export function KeyboardTest() {
  return (
    <TestSuite name="Keyboard">
      <TestCase
        itShould="not crash when using keyboard module"
        fn={({expect}) => {
          expect(Keyboard.isVisible()).to.be.false;
        }}
      />
      <TestCase modal itShould="dismiss keyboard on button press">
        <TextInput style={styles.textInput} />
        <Button label="Dismiss keyboard" onPress={() => Keyboard.dismiss()} />
      </TestCase>
      <TestCase
        modal
        skip
        itShould="display info when opening and hiding keyboard">
        <View style={{height: 300}}>
          <ObjectDisplayer
            renderContent={setObject => {
              useEffect(() => {
                const showSubscription = Keyboard.addListener(
                  'keyboardDidShow',
                  () => {
                    setObject('Keyboard Shown');
                  },
                );
                const hideSubscription = Keyboard.addListener(
                  'keyboardDidHide',
                  () => {
                    setObject('Keyboard Hidden');
                  },
                );

                return () => {
                  showSubscription.remove();
                  hideSubscription.remove();
                };
              }, []);
              return (
                <>
                  <TextInput style={styles.textInput} />
                  <Button
                    label={'Dismiss keyboard'}
                    onPress={() => Keyboard.dismiss()}
                  />
                </>
              );
            }}
          />
        </View>
      </TestCase>
    </TestSuite>
  );
}

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    borderColor: 'silver',
    backgroundColor: '#444',
    height: 32, // hack
    borderRadius: 8,
    marginTop: 8,
    padding: 8,
    fontSize: 16,
    color: 'white',
  },
  buttonText: {
    width: '100%',
    height: '100%',
    fontWeight: 'bold',
  },
});

export default KeyboardTest;
