import {
  ReturnKeyType,
  ReturnKeyTypeAndroid,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import {TestSuite, TestCase} from '@rnoh/testerino';
import {useState} from 'react';
import {Button, Effect, StateKeeper} from '../components';

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
      <TestCase modal itShould="render textInput with Pacifico Regular font">
        <TextInputWithText
          style={[styles.textInput, {fontFamily: 'Pacifico-Regular'}]}
        />
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
      <TestCase modal itShould="render textinput with green selection color">
        <TextInputWithText style={styles.textInput} selectionColor="green" />
      </TestCase>
      <TestCase modal itShould="render multiline text input">
        <TextInputWithText style={styles.textInputBigger} multiline />
      </TestCase>
      <TestCase
        modal
        itShould="render multiline text input with Pacifico Regular font">
        <TextInputWithText
          style={[styles.textInputBigger, {fontFamily: 'Pacifico-Regular'}]}
          multiline
        />
      </TestCase>
      <TestCase modal itShould="render text input with maximally 10 characters">
        <TextInputWithText style={styles.textInput} maxLength={10} />
      </TestCase>
      <TestCase modal itShould="toggle between rendering 10 and 5 characters">
        <StateKeeper
          initialValue={10}
          renderContent={(maxLength, setMaxLength) => {
            return (
              <Effect
                onMount={() => {
                  const interval = setInterval(() => {
                    setMaxLength(prev => (prev === 10 ? 5 : 10));
                  }, 1000);
                  return () => {
                    clearInterval(interval);
                  };
                }}>
                <TextInputWithText
                  style={styles.textInput}
                  maxLength={maxLength}
                  value="1234567890"
                />
              </Effect>
            );
          }}
        />
      </TestCase>
      <TestCase
        modal
        itShould="automatically focus textInput when displayed"
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
        initialState={false}
        arrange={({setState}) => (
          <TextInputWithText
            style={styles.textInput}
            onSubmitEditing={() => setState(true)}
          />
        )}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
      <TestCase modal itShould="toggle between different return keys">
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
      <TestCase modal itShould="show text input with default value">
        <DefaultProps />
      </TestCase>
      <TestCase
        modal
        itShould="trigger onLayout event on mount"
        initialState={{}}
        arrange={({setState}) => {
          const [layout, setLayout] = useState('');
          return (
            <>
              <Text>{layout}</Text>
              <TextInput
                style={styles.textInput}
                onLayout={event => {
                  setLayout(JSON.stringify(event.nativeEvent.layout));
                  setState(event.nativeEvent.layout);
                }}
              />
              ;
            </>
          );
        }}
        assert={({expect, state}) => {
          expect(state).to.include.all.keys('width', 'height', 'x', 'y');
        }}
      />
      <TestCase
        modal
        itShould="render textinputs with different keyboard types">
        <View>
          <TextInputKeyboardType keyboardType="default" />
          <TextInputKeyboardType keyboardType="number-pad" />
          <TextInputKeyboardType keyboardType="decimal-pad" />
          <TextInputKeyboardType keyboardType="numeric" />
          <TextInputKeyboardType keyboardType="email-address" />
          <TextInputKeyboardType keyboardType="phone-pad" />
          <TextInputKeyboardType keyboardType="url" />
        </View>
      </TestCase>
    </TestSuite>
  );
}
const TextInputKeyboardType = (props: TextInputProps) => {
  return (
    <>
      <Text>{props.keyboardType}</Text>
      <TextInput
        style={{...styles.textInputSmall, marginBottom: 10}}
        keyboardType={props.keyboardType}
      />
    </>
  );
};
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
    'done',
    'go',
    'next',
    'search',
    'send',
    'none',
    'previous', //currently not supported by ArkUI
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
  textInputSmall: {
    height: 20, // hack
    fontSize: 8,
    color: 'black',
    backgroundColor: 'rgb(245, 240, 211)',
    borderRadius: 20,
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
