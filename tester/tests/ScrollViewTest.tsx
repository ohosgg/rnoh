import {View, ScrollView, Text} from 'react-native';
import {TestSuite, TestCase} from '@rnoh/testerino';
import React, {useState} from 'react';
import {Button, Modal} from '../components';

export function ScrollViewTest() {
  return (
    <TestSuite name="ScrollView">
      <TestCase itShould="render scroll view with different rounded corners">
        <Modal>
          <View
            style={{
              width: 200,
              height: '80%',
            }}>
            <ScrollView
              style={{
                borderWidth: 3,
                borderColor: 'firebrick',
                borderTopLeftRadius: 10,
                borderTopRightRadius: 20,
                borderBottomRightRadius: 30,
                borderBottomLeftRadius: 40,
                backgroundColor: 'beige',
              }}
              contentContainerStyle={{
                alignItems: 'center',
                justifyContent: 'center',
              }}
              scrollEventThrottle={16}>
              <ScrollViewContent />
            </ScrollView>
          </View>
        </Modal>
      </TestCase>
      <TestCase itShould="change rectangles colors to green when releasing scroll">
        <Modal>
          <MomentumTestCase />
        </Modal>
      </TestCase>
      <TestCase itShould="render horizontal scroll view">
        <Modal>
          <View
            style={{
              width: '100%',
              height: 150,
            }}>
            <ScrollView
              style={{
                borderWidth: 3,
                borderColor: 'firebrick',
                backgroundColor: 'beige',
              }}
              contentContainerStyle={{
                alignItems: 'center',
                justifyContent: 'center',
              }}
              horizontal={true}
              scrollEventThrottle={16}>
              {new Array(5).fill(0).map((_, idx) => {
                return (
                  <View
                    key={idx}
                    style={{
                      width: 160,
                      height: '100%',
                      backgroundColor: 'pink',
                      marginRight: 80,
                    }}
                  />
                );
              })}
            </ScrollView>
          </View>
        </Modal>
      </TestCase>
      <TestCase itShould="[FAILS] support sticky headers">
        {/* this test fails on Android (and possible on Harmony) */}
        <Modal>
          <View
            style={{
              width: 200,
              height: '100%',
            }}>
            <ScrollView
              style={{width: '100%', height: '100%'}}
              stickyHeaderIndices={[0, 1]}>
              <View
                style={{
                  width: '100%',
                  height: 50,
                  backgroundColor: 'red',
                }}
              />
              {new Array(20).fill(0).map((_, idx) => {
                return (
                  <View
                    key={idx}
                    style={{
                      width: '100%',
                      height: 50,
                      backgroundColor: idx % 2 ? 'pink' : 'blue',
                    }}
                  />
                );
              })}
            </ScrollView>
          </View>
        </Modal>
      </TestCase>
      <TestCase itShould="show vertical scroll indicator">
        <Modal>
          <View style={{width: 200, height: '80%'}}>
            <ScrollView showsVerticalScrollIndicator={true}>
              <ScrollViewContent />
            </ScrollView>
          </View>
        </Modal>
      </TestCase>
      <TestCase itShould="hide vertical scroll indicator">
        <Modal>
          <View style={{width: 200, height: '80%'}}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <ScrollViewContent />
            </ScrollView>
          </View>
        </Modal>
      </TestCase>
      <TestCase itShould="show horizontal scroll indicator">
        <Modal>
          <View style={{width: 200, height: '80%'}}>
            <ScrollView showsHorizontalScrollIndicator={true} horizontal>
              <ScrollViewContentHorizontal />
            </ScrollView>
          </View>
        </Modal>
      </TestCase>
      <TestCase itShould="hide horizontal scroll indicator">
        <Modal>
          <View style={{width: 200, height: '80%'}}>
            <ScrollView showsHorizontalScrollIndicator={false} horizontal>
              <ScrollViewContentHorizontal />
            </ScrollView>
          </View>
        </Modal>
      </TestCase>
    </TestSuite>
  );
}

function MomentumTestCase() {
  const [hasDragBegan, setHasDragBegan] = useState(0);
  const [hasDragEnded, setHasDragEnded] = useState(0);
  const [hasMomentumBegan, setHasMomentumBegan] = useState(0);
  const [hasMomentumEnded, setHasMomentumEnded] = useState(0);

  return (
    <>
      <Button
        label="Reset"
        onPress={() => {
          setHasDragBegan(0);
          setHasDragEnded(0);
          setHasMomentumBegan(0);
          setHasMomentumEnded(0);
        }}
      />
      <View style={{backgroundColor: 'white', width: '100%'}}>
        <Text style={{height: 16}}>hasMomentumBegan: {hasMomentumBegan}</Text>
        <Text style={{height: 16}}>hasMomentumEnded: {hasMomentumEnded}</Text>
        <Text style={{height: 16}}>hasDragBegan: {hasDragBegan}</Text>
        <Text style={{height: 16}}>hasDragEnded: {hasDragEnded}</Text>
      </View>

      <View style={{width: 200, height: 200}}>
        <ScrollView
          onScrollBeginDrag={() => {
            setHasDragBegan(p => p + 1);
          }}
          onScrollEndDrag={() => {
            setHasDragEnded(p => p + 1);
          }}
          onMomentumScrollBegin={() => {
            setHasMomentumBegan(p => p + 1);
          }}
          onMomentumScrollEnd={() => {
            setHasMomentumEnded(p => p + 1);
          }}>
          <View style={{backgroundColor: 'red', width: '100%', height: 150}} />
          <View style={{backgroundColor: 'blue', width: '100%', height: 150}} />
          <View
            style={{backgroundColor: 'green', width: '100%', height: 150}}
          />
          <View style={{backgroundColor: 'red', width: '100%', height: 150}} />
        </ScrollView>
      </View>
    </>
  );
}

function ScrollViewContent() {
  return new Array(10).fill(0).map((_, idx) => {
    return (
      <View
        key={idx}
        style={{
          width: '100%',
          height: 50,
          backgroundColor: 'pink',
          marginBottom: 50,
        }}
      />
    );
  })
}

function ScrollViewContentHorizontal() {
  return new Array(10).fill(0).map((_, idx) => {
    return (
      <View
        key={idx}
        style={{
          width: 50,
          height: '100%',
          backgroundColor: 'pink',
          marginRight: 50,
        }}
      />
    );
  })
}
