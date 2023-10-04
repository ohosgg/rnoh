import {TestSuite, TestCase} from '@rnoh/testerino';
import {Button} from '../components';
import {Alert, Text} from 'react-native';
import {useState} from 'react';

export function AlertTest() {
  return (
    <TestSuite name="Alert">
      <TestCase
        itShould="show simple alert on click"
        initialState={false}
        arrange={({setState, reset}) => (
          <Button
            label="show alert"
            onPress={() => {
              reset();
              Alert.alert('Test Alert', 'Message', [
                {text: 'OK', onPress: () => setState(true)},
              ]);
            }}
          />
        )}
        assert={({state, expect}) => {
          expect(state).to.be.true;
        }}
      />
      <TestCase
        itShould="display name of the button clicked in alert"
        initialState={false}
        arrange={({setState, reset}) => (
          <AlertView setState={setState} reset={reset} />
        )}
        assert={({state, expect}) => {
          expect(state).to.be.true;
        }}
      />
      <TestCase
        itShould="cancel alert on press outside its window"
        initialState={false}
        arrange={({setState, reset}) => (
          <Button
            label="show alert"
            onPress={() => {
              reset();
              Alert.alert(
                'Test Alert',
                'Press outside to dismiss',
                [{text: 'OK', onPress: () => setState(false)}],
                {
                  cancelable: true,
                  onDismiss: () => setState(true),
                },
              );
            }}
          />
        )}
        assert={({state, expect}) => {
          expect(state).to.be.true;
        }}
      />
    </TestSuite>
  );
}

const AlertView = (props: {
  setState: React.Dispatch<React.SetStateAction<boolean>>;
  reset: () => void;
}) => {
  const [text, setText] = useState('');
  const laterOnPress = () => {
    props.setState(true);
    setText('Later');
  };
  const cancelOnPress = () => {
    props.setState(true);
    setText('Cancel');
  };
  const okOnPress = () => {
    props.setState(true);
    setText('OK');
  };
  return (
    <>
      <Text>{text}</Text>
      <Button
        label="show alert"
        onPress={() => {
          props.reset();
          Alert.alert('Test Alert', 'Message', [
            {
              text: 'Later',
              onPress: laterOnPress,
            },
            {text: 'Cancel', onPress: cancelOnPress},
            {text: 'OK', onPress: okOnPress},
          ]);
        }}
      />
    </>
  );
};
