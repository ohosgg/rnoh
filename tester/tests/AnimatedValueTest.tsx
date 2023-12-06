import React, {useRef, useState} from 'react';

import {Animated, View, Text} from 'react-native';

import {TestCase, TestSuite} from '@rnoh/testerino';
import {Button} from '../components';

export function AnimatedValueTest() {
  return (
    <>
      <TestSuite name="Animated.Value">
        <TestCase
          itShould="move square 200px to the right and stop animation on pressing setValue"
          initialState={0}
          arrange={({setState}) => (
            <SetValueView singular setState={setState} />
          )}
          assert={({expect, state}) => {
            expect(state).to.be.eq(200);
          }}
        />
        <TestCase itShould="add and remove listeners on click">
          <ListenerView singular={true} />
        </TestCase>
        <TestCase itShould="move square 200px to the right on pressing setOffset">
          <SetOffsetView singular={true} />
        </TestCase>
      </TestSuite>
      <TestSuite name="Animated.ValueXY">
        <TestCase
          itShould="move square 100px to the right and stop animation on pressing setValue"
          initialState={0}
          arrange={({setState}) => <SetValueView setState={setState} />}
          assert={({expect, state}) => {
            expect(state).to.be.eq(100);
          }}
        />
        <TestCase itShould="add and remove listeners on click">
          <ListenerView singular={false} />
        </TestCase>
        <TestCase itShould="move square 100px to the right on pressing setOffset">
          <SetOffsetView singular={false} />
        </TestCase>
        <TestCase
          itShould="get layout of animated value on press"
          initialState={JSON.stringify({left: 0, top: 0})}
          arrange={({setState}) => {
            const value = useRef(new Animated.ValueXY({x: 1, y: 1})).current;
            const [text, setText] = useState('');
            const onPress = () => {
              const layout = JSON.stringify(value.getLayout());
              setState(layout);
              setText(layout);
            };
            return (
              <>
                <Text>{text}</Text>
                <Button label="get layout" onPress={onPress} />
              </>
            );
          }}
          assert={({state, expect}) => {
            expect(state).to.be.eq(JSON.stringify({left: 1, top: 1}));
          }}
        />
        <TestCase itShould="move square to the right after extract offset">
          <ExtractOffsetView />
        </TestCase>
        <TestCase itShould="move square to the left after flatten offset">
          <FlattenOffsetView />
        </TestCase>
      </TestSuite>
    </>
  );
}
const ExtractOffsetView = () => {
  const value = useRef(new Animated.Value(0)).current;
  const animation = Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: 100,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]),
  );
  return (
    <View style={{width: '100%'}}>
      <Animated.View
        style={{
          height: 20,
          width: 20,
          margin: 10,
          backgroundColor: 'red',
          transform: [
            {
              translateX: value,
            },
          ],
        }}
      />
      <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        <Button
          label="start"
          onPress={() => {
            animation.reset();
            animation.start();
          }}
        />
        <Button label="stop" onPress={() => animation.stop()} />
        <Button label="extract offset" onPress={() => value.extractOffset()} />
      </View>
    </View>
  );
};
const FlattenOffsetView = () => {
  const value = useRef(new Animated.Value(0)).current;
  const animation = Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: 100,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]),
  );
  value.setOffset(100);
  return (
    <View style={{width: '100%'}}>
      <Animated.View
        style={{
          height: 20,
          width: 20,
          margin: 10,
          backgroundColor: 'red',
          transform: [
            {
              translateX: value,
            },
          ],
        }}
      />
      <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        <Button
          label="start"
          onPress={() => {
            animation.reset();
            animation.start();
          }}
        />
        <Button label="stop" onPress={() => animation.stop()} />
        <Button
          label="flatten offset"
          onPress={() => {
            value.flattenOffset();
          }}
        />
      </View>
    </View>
  );
};
const SetOffsetView = (props: {singular: boolean}) => {
  if (props.singular) {
    const value = useRef(new Animated.Value(0)).current;

    return (
      <MovingSquare
        value={value}
        labels={['set offset']}
        onPresses={[() => value.setOffset(200)]}
      />
    );
  } else {
    const value = useRef(new Animated.ValueXY({x: 0, y: 0})).current;

    return (
      <MovingSquareXY
        value={value}
        labels={['set offset']}
        onPresses={[() => value.setOffset({x: 100, y: 0})]}
      />
    );
  }
};

const ListenerView = (props: {singular: boolean}) => {
  const [text, setText] = useState('');
  const [listeners, setlisteners] = useState<string[]>([]);
  const value = props.singular
    ? useRef(new Animated.Value(0)).current
    : useRef(new Animated.ValueXY({x: 0, y: 0})).current;
  const listener = () => {};
  const addListener = () => {
    listeners.push(value.addListener(listener));
    setlisteners(listeners);
    checkListener();
  };
  const removeListener = () => {
    const lastListener = listeners.pop();
    if (lastListener) {
      value.removeListener(lastListener);
    }
    checkListener();
  };
  const removeAll = () => {
    value.removeAllListeners();
    checkListener();
  };
  const checkListener = () => {
    setText(
      value.hasListeners()
        ? `listener: ${listeners}`
        : 'no listener is attached',
    );
  };
  return (
    <>
      <Text>{text}</Text>
      {props.singular ? (
        <MovingSquare
          value={value as Animated.Value}
          labels={['add', 'remove', 'removeAll']}
          onPresses={[addListener, removeListener, removeAll]}
        />
      ) : (
        <MovingSquareXY
          value={value as Animated.ValueXY}
          labels={['add', 'remove', 'removeAll']}
          onPresses={[addListener, removeListener, removeAll]}
        />
      )}
    </>
  );
};

const SetValueView = (props: {
  singular?: boolean;
  setState: React.Dispatch<React.SetStateAction<number>>;
}) => {
  if (props.singular) {
    const animValue = useRef(new Animated.Value(0)).current;
    animValue.addListener(({value}) => {
      if (value === 200) {
        props.setState(value);
      }
    });

    return (
      <MovingSquare
        value={animValue}
        labels={['set value']}
        onPresses={[() => animValue.setValue(200)]}
      />
    );
  } else {
    const animValue = useRef(new Animated.ValueXY({x: 0, y: 0})).current;
    animValue.addListener(({x}) => {
      if (x === 100) {
        props.setState(x);
      }
    });
    return (
      <MovingSquareXY
        value={animValue}
        labels={['set valueXY']}
        onPresses={[() => animValue.setValue({x: 100, y: 0})]}
      />
    );
  }
};

const MovingSquare = (props: {
  value: Animated.Value;
  labels: string[];
  onPresses: (() => void)[];
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const animation = Animated.loop(
    Animated.sequence([
      Animated.timing(props.value, {
        toValue: 100,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(props.value, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]),
  );
  const animate = () => {
    if (isRunning) {
      animation.stop();
      animation.reset();
      props.value.setOffset(0);
      setIsRunning(false);
    } else {
      setIsRunning(true);
      animation.start();
    }
  };
  const buttons = props.labels.map((value, index) => (
    <Button label={value} onPress={props.onPresses[index]} key={index} />
  ));
  return (
    <View style={{width: '100%'}}>
      <Animated.View
        style={{
          height: 20,
          width: 20,
          margin: 10,
          backgroundColor: 'red',
          transform: [
            {
              translateX: props.value,
            },
          ],
        }}
      />
      <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        <Button label="animate" onPress={animate} />
        {buttons}
      </View>
    </View>
  );
};

const MovingSquareXY = (props: {
  value: Animated.ValueXY;
  labels: string[];
  onPresses: (() => void)[];
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const animation = Animated.loop(
    Animated.sequence([
      Animated.timing(props.value, {
        toValue: {x: 25, y: 25},
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(props.value, {
        toValue: {x: 0, y: 0},
        duration: 500,
        useNativeDriver: true,
      }),
    ]),
  );
  const animate = () => {
    if (isRunning) {
      animation.stop();
      props.value.setOffset({x: 0, y: 0});
      setIsRunning(false);
    } else {
      setIsRunning(true);
      animation.start();
    }
  };
  const buttons = props.labels.map((value, index) => (
    <Button label={value} onPress={props.onPresses[index]} key={index} />
  ));
  return (
    <View style={{width: '100%', height: 100}}>
      <Animated.View
        style={{
          height: 20,
          width: 20,
          margin: 10,
          backgroundColor: 'red',
          transform: [
            {
              translateX: props.value.x,
            },
            {translateY: props.value.y},
          ],
        }}
      />
      <View style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 20}}>
        <Button label="animate" onPress={animate} />
        {buttons}
      </View>
    </View>
  );
};
