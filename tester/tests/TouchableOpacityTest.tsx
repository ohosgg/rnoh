import {Text, TouchableOpacity, View, ViewProps} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';
import {useState} from 'react';

export const TouchableOpacityTest = () => {
  const [pressCountOpacity, setPressCountOpacity] = useState(0);
  const [onLayoutTestText, setOnLayoutTestText] = useState('');
  return (
    <TestSuite name="TouchableOpacity">
      <TestCase itShould="make the text less visible on press">
        <TouchableOpacity onPress={() => {}}>
          <PressMe />
        </TouchableOpacity>
      </TestCase>
      <TestCase itShould="make the text slightly less visible on press (activeOpacity)">
        <TouchableOpacity activeOpacity={0.5} onPress={() => {}}>
          <PressMe />
        </TouchableOpacity>
      </TestCase>
      <TestCase itShould="show number of presses on press">
        <TouchableOpacity
          onPress={() => setPressCountOpacity(pressCountOpacity + 1)}>
          <PressMe endLabel={pressCountOpacity} />
        </TouchableOpacity>
      </TestCase>
      <TestCase itShould="render disabled">
        <TouchableOpacity disabled>
          <PressMe endLabel={'disabled'} />
        </TouchableOpacity>
      </TestCase>
      <TestCase itShould="show layout data onLayout">
        <TouchableOpacity
          onLayout={event => {
            setOnLayoutTestText(JSON.stringify(event.nativeEvent.layout));
          }}>
          <PressMe endLabel={onLayoutTestText} />
        </TouchableOpacity>
      </TestCase>
      <TestCase itShould="show square (red background, white border, rounded corners)">
        <TouchableOpacity
          style={{
            backgroundColor: 'rgb(255, 0, 0)',
            width: 100,
            height: 100,
            borderWidth: 3,
            borderColor: 'white',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 20,
            borderBottomRightRadius: 30,
            borderBottomLeftRadius: 40,
          }}>
          <PressMe />
        </TouchableOpacity>
      </TestCase>
    </TestSuite>
  );
};

function PressMe(props: ViewProps & {endLabel?: string | number}) {
  return (
    <View {...props} style={{padding: 16, borderWidth: 1}}>
      <Text style={{color: 'blue', height: 24, width: '100%'}}>
        Press me{props.endLabel !== undefined ? ` (${props.endLabel})` : ''}
      </Text>
    </View>
  );
}
