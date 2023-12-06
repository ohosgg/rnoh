import {TestSuite, TestCase} from '@rnoh/testerino';
import {
  Keyboard,
  StyleSheet,
  TextInput,
  KeyboardEvent,
  Dimensions,
} from 'react-native';
import {Button} from '../components';
import {useEffect} from 'react';
import {EmitterSubscription} from 'react-native/Libraries/vendor/emitter/EventEmitter';

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
        initialState={{
          keyboardDidHide: false,
          keyboardDidShow: true,
          keyboardEvent: {} as KeyboardEvent,
        }}
        itShould="not open the keyboard after opening the modal"
        arrange={({setState, reset}) => {
          return (
            <KeyboardEventsView
              listenToShow
              checkIfKeyboardIsVisible
              onSetState={setState}
              reset={reset}
            />
          );
        }}
        assert={({expect, state}) => {
          expect(state.keyboardDidShow).to.be.false;
          expect(state.keyboardDidHide).to.be.false;
        }}
        // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/380
      />
      <TestCase
        modal
        initialState={{
          keyboardDidHide: false,
          keyboardDidShow: false,
          keyboardEvent: {} as KeyboardEvent,
        }}
        itShould="pass after opening the keyboard"
        arrange={({setState, reset}) => {
          return (
            <KeyboardEventsView
              listenToShow
              dismissOnReset
              onSetState={setState}
              reset={reset}
            />
          );
        }}
        assert={({expect, state}) => {
          expect(state.keyboardDidShow).to.be.true;
          expect(state.keyboardDidHide).to.be.false;
          expect(state.keyboardEvent.endCoordinates.height).to.be.greaterThan(
            0,
          );
          expect(state.keyboardEvent.endCoordinates.width).to.be.greaterThan(0);
          expect(state.keyboardEvent.endCoordinates.screenY).to.be.lessThan(
            Dimensions.get('window').height,
          );
          expect(state.keyboardEvent.endCoordinates.screenX).to.be.equal(0);
        }}
      />
      <TestCase
        modal
        initialState={{
          keyboardDidHide: false,
          keyboardDidShow: false,
          keyboardEvent: {} as KeyboardEvent,
        }}
        itShould="pass after dismissing the keyboard"
        arrange={({setState, reset}) => {
          return (
            <KeyboardEventsView
              listenToHide
              showDismissButton
              onSetState={setState}
              reset={reset}
            />
          );
        }}
        assert={({expect, state}) => {
          expect(state.keyboardDidHide).to.be.true;
          expect(state.keyboardDidShow).to.be.false;
          expect(state.keyboardEvent.endCoordinates.height).to.be.equal(0);
          expect(state.keyboardEvent.endCoordinates.width).to.be.greaterThan(0);
          expect(state.keyboardEvent.endCoordinates.screenY).to.be.closeTo(
            Dimensions.get('window').height,
            10,
          );
          expect(state.keyboardEvent.endCoordinates.screenX).to.be.equal(0);
        }}
      />
    </TestSuite>
  );
}

function KeyboardEventsView(props: {
  autofocus?: boolean;
  dismissOnReset?: boolean;
  listenToHide?: boolean;
  checkIfKeyboardIsVisible?: boolean;
  listenToShow?: boolean;
  showDismissButton?: boolean;
  onSetState: React.Dispatch<
    React.SetStateAction<{
      keyboardDidShow: boolean;
      keyboardDidHide: boolean;
      keyboardEvent: KeyboardEvent;
    }>
  >;
  reset: () => void;
}) {
  useEffect(() => {
    let showSubscription: EmitterSubscription;
    let hideSubscription: EmitterSubscription;
    if (props.listenToShow) {
      showSubscription = Keyboard.addListener('keyboardDidShow', event => {
        props.onSetState(prev => ({
          ...prev,
          keyboardEvent: event,
          keyboardDidShow: true,
        }));
      });
    }
    if (props.listenToHide) {
      hideSubscription = Keyboard.addListener('keyboardDidHide', event => {
        props.onSetState(prev => ({
          ...prev,
          keyboardEvent: event,
          keyboardDidHide: true,
        }));
      });
    }
    if (props.checkIfKeyboardIsVisible) {
      setTimeout(() => {
        if (!Keyboard.isVisible()) {
          props.onSetState(prev => ({...prev, keyboardDidShow: false}));
        }
      }, 1000);
    }

    return () => {
      if (props.listenToShow) {
        showSubscription.remove();
      }
      if (props.listenToHide) {
        hideSubscription.remove();
      }
    };
  }, []);

  return (
    <>
      <TextInput style={styles.textInput} autoFocus={props.autofocus} />
      {props.showDismissButton && (
        <Button label={'dismiss keyboard'} onPress={() => Keyboard.dismiss()} />
      )}
      <Button
        label="reset"
        onPress={() => {
          if (props.dismissOnReset) {
            Keyboard.dismiss();
          }
          props.reset();
        }}
      />
    </>
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
