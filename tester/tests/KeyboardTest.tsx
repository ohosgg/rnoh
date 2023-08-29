import {TestSuite, TestCase} from '@rnoh/testerino';
import {Keyboard, StyleSheet, Text, TextInput, View} from 'react-native';

export function KeyboardTest() {
  return (
    <TestSuite name="Keyboard">
      <TestCase
        itShould="not crash when using keyboard module"
        fn={({expect}) => {
          expect(Keyboard.isVisible()).to.be.false;
        }}
      />
      <TestCase modal itShould="[FAILS] dismiss keyboard on button press">
        <TextInput style={styles.textInput} />
        <View style={styles.button} onTouchEnd={() => Keyboard.dismiss()}>
          <Text style={styles.buttonText}>Dismiss keyboard</Text>
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
  button: {
    width: 160,
    height: 36,
    backgroundColor: 'hsl(190, 50%, 70%)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    width: '100%',
    height: '100%',
    fontWeight: 'bold',
  },
});

export default KeyboardTest;
