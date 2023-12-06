import {TestCase, TestSuite} from '@rnoh/testerino';
import React, {useState} from 'react';
import {Modal, StyleSheet, Text, View, ModalProps} from 'react-native';
import {Button} from '../components';

export function ModalTest() {
  return (
    <TestSuite name="Modal">
      <TestCase itShould="show modal">
        <ModalExample />
      </TestCase>
      <TestCase
        itShould="trigger onShow event after modal is shown"
        initialState={false}
        arrange={({setState}) => (
          <ModalExample
            onShow={() => {
              setState(true);
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

const ModalExample = (props: ModalProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View>
      <Text style={[styles.textStyle, {color: 'black'}]}>
        {modalVisible ? 'shown' : 'hidden'}
      </Text>
      <Modal
        {...props}
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Hello World!</Text>
            <Button label="Hide Modal" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <Button label="Show Modal" onPress={() => setModalVisible(true)} />
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    height: 20,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    height: 20,
  },
});
