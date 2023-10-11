import {
  ReturnKeyType,
  ReturnKeyTypeAndroid,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
} from 'react-native';
import {TestSuite, TestCase} from '@rnoh/testerino';
import {useState} from 'react';
import {Button} from '../components';

export function TextInputTest() {
  return (
    <TestSuite name="TextInput">
      <TestCase
        modal
        itShould="render textinput and change the text component based on the values inputted">
        <TextInputWithText style={styles.textInput} />
      </TestCase>
      <TestCase modal itShould="render non-editable textInput">
        <TextInputWithText style={styles.textInput} editable={false} />
      </TestCase>
      <TestCase modal itShould="render textInput with caret hidden">
        <TextInputWithText style={styles.textInput} caretHidden />
      </TestCase>
      <TestCase
        modal
        itShould="blur text on submit"
        skip
        //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/403
        initialState={false}
        arrange={({setState}) => {
          return (
            <>
              <TextInputWithText
                style={styles.textInput}
                blurOnSubmit
                onBlur={() => setState(true)}
              />
            </>
          );
        }}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
      <TestCase
        modal
        itShould="not blur text on submit"
        skip
        //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/403
      >
        <TextInputWithText style={styles.textInput} blurOnSubmit={false} />
      </TestCase>
      <TestCase
        modal
        itShould="render textInput with blue underline"
        skip
        //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/404
      >
        <TextInputWithText
          style={styles.textInput}
          underlineColorAndroid={'blue'}
        />
      </TestCase>
      <TestCase
        modal
        itShould="focus textInput on click"
        skip
        //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/405
        initialState={false}
        arrange={({setState}) => (
          <TextInput style={styles.textInput} onFocus={() => setState(true)} />
        )}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
      <TestCase modal itShould="render textinput with red placeholder">
        <TextInputWithText
          style={styles.textInput}
          placeholder="Placeholder"
          placeholderTextColor={'red'}
        />
      </TestCase>
      <TestCase
        modal
        itShould="render textinput with green selection color"
      >
        <TextInputWithText style={styles.textInput} selectionColor="green" />
      </TestCase>
      <TestCase
        modal
        itShould="render multiline text input"
        skip
        //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/409
      >
        <TextInputWithText style={styles.textInputBigger} multiline />
      </TestCase>
      <TestCase
        modal
        itShould="render text input with maximally 10 characters"
      >
        <TextInputWithText style={styles.textInput} maxLength={10} />
      </TestCase>
      <TestCase
        modal
        itShould="automatically focus textInput when displayed"
        skip
        //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/405
        initialState={false}
        arrange={({setState}) => (
          <TextInputWithText
            style={styles.textInput}
            autoFocus
            onFocus={() => setState(true)}
          />
        )}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
      <TestCase
        modal
        itShould="toggle between different capitalization modes"
        skip
        //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/408
      >
        <AutoCapitalize />
      </TestCase>
      <TestCase
        modal
        itShould="trigger onSubmitEditing event after submiting"
        skip
        //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/411
        initialState={false}
        arrange={({setState}) => (
          <TextInputWithText
            style={styles.textInput}
            autoFocus
            onSubmitEditing={() => setState(true)}
          />
        )}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
      <TestCase
        modal
        itShould="toggle between different return keys"
        skip
        //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/412
      >
        <ReturnKeyTypeView />
      </TestCase>
      <TestCase modal itShould="render secure text input (text obscured)">
        <TextInputWithText style={styles.textInput} secureTextEntry />
      </TestCase>
      <TestCase
        modal
        itShould="trigger onKeyPress event after pressing key (press 'A' to pass)"
        skip
        //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/413
        initialState={''}
        arrange={({setState}) => (
          <TextInputWithText
            style={styles.textInput}
            autoFocus
            onKeyPress={event => setState(event.nativeEvent.key)}
          />
        )}
        assert={({expect, state}) => {
          expect(state).to.be.eq('A');
        }}
      />
      <TestCase
        modal
        itShould="show text input with default value"
        skip
        //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/414
      >
        <DefaultProps />
      </TestCase>
    </TestSuite>
  );
}

const TextInputWithText = (props: TextInputProps) => {
  const [text, onChangeText] = useState('');
  return (
    <>
      <Text style={styles.text}>{text}</Text>
      <TextInput {...props} onChangeText={onChangeText} value={text} />
    </>
  );
};
type CapitalizationType = 'none' | 'sentences' | 'words' | 'characters';
const AutoCapitalize = () => {
  const [state, setState] = useState<CapitalizationType>('none');
  const capitalizations: Array<CapitalizationType> = [
    'none',
    'sentences',
    'words',
    'characters',
  ];
  const toggleCapitalization = () => {
    const index = capitalizations.indexOf(state);
    setState(capitalizations[(index + 1) % capitalizations.length]);
  };
  return (
    <>
      <TextInputWithText style={styles.textInput} autoCapitalize={state} />
      <Button label="toggle capitalize mode" onPress={toggleCapitalization} />
      <Text>Capitalize mode: {state}</Text>
    </>
  );
};
const ReturnKeyTypeView = () => {
  const [state, setState] = useState<ReturnKeyType | ReturnKeyTypeAndroid>(
    'none',
  );
  const returnKey: Array<ReturnKeyType | ReturnKeyTypeAndroid> = [
    'none',
    'go',
    'next',
    'search',
    'send',
    'none',
    'previous',
  ];
  const toggleReturnKey = () => {
    const index = returnKey.indexOf(state);
    setState(returnKey[(index + 1) % returnKey.length]);
  };
  return (
    <>
      <TextInputWithText style={styles.textInput} returnKeyType={state} />
      <Button label="toggle return key type" onPress={toggleReturnKey} />
      <Text>Return key: {state}</Text>
    </>
  );
};

const DefaultProps = () => {
  // @ts-ignore
  TextInput.defaultProps = {
    value: 'defaultText',
  };

  return <TextInput style={styles.textInput} />;
};

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    backgroundColor: 'red',
  },
  text: {
    width: '100%',
    height: 40,
  },
  textInput: {
    height: 40, // hack
    fontSize: 16,
    color: 'black',
    backgroundColor: 'rgb(245, 240, 211)',
    borderRadius: 40,
  },
  textInputBigger: {
    height: 80, // hack
    fontSize: 16,
    color: 'black',
    backgroundColor: 'rgb(245, 240, 211)',
    borderRadius: 20,
  },
});
