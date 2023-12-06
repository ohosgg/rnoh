import React, {useRef, useState} from 'react';

import {Animated, Pressable, Text, View} from 'react-native';

import {TestCase, TestSuite} from '@rnoh/testerino';
import {Button} from '../components';

export function AnimatedTest() {
  return (
    <TestSuite name="Animated">
      <TestCase itShould="update the button label after a delay">
        <AnimatedEndCallbackTest />
      </TestCase>
      <TestCase itShould="animate width">
        <AnimatedRectangle />
      </TestCase>
      <TestCase itShould="move red square horizontally relatively to the scroll offset">
        <AnimatedScrollViewTestCase />
      </TestCase>
      <TestCase itShould="fade in and out when clicked">
        <FadeInOut />
        <FadeInOut nativeDriver />
      </TestCase>
      <TestCase itShould="rotate grey square after red square with 0.5 second delay">
        <Delay />
      </TestCase>
      <TestCase itShould="rotate red square in a loop">
        <Loop />
      </TestCase>
      <TestCase itShould="rotate both squares in paralell">
        <Parallel />
      </TestCase>
      <TestCase itShould="rotate button on press">
        <AnimatedPressableView />
      </TestCase>
      <TestCase itShould="rotate squares with different stiffness/mass">
        <Spring />
      </TestCase>
      <TestCase itShould="move squares with different initial velocity and deceleration values">
        <Decay />
      </TestCase>
      <TestCase itShould="move square immediately after pressing button">
        <DiffClamp />
      </TestCase>
      <TestCase itShould="move grey square 2x further horizontally than red">
        <Multiply />
      </TestCase>
      <TestCase itShould="move grey twice but half the total distance of red">
        <Modulo />
      </TestCase>
      <TestCase skip itShould="move red square closer">
        <Perspective />
      </TestCase>
      <TestCase itShould="move square both vertically and horizontally">
        <ValueXY />
      </TestCase>
      <TestCase
        skip
        itShould="(broken everywhere) move both squares, with blue square following the red with a spring">
        <TrackingValue />
      </TestCase>
    </TestSuite>
  );
}

function AnimatedRectangle() {
  const animWidth = React.useRef(new Animated.Value(100)).current;

  const animation = React.useMemo(() => {
    const expand = Animated.timing(animWidth, {
      toValue: 300,
      duration: 1000,
      useNativeDriver: false,
    });
    const contract = Animated.timing(animWidth, {
      toValue: 100,
      duration: 1000,
      useNativeDriver: false,
    });
    return Animated.sequence([expand, contract]);
  }, []);

  return (
    <Animated.View
      style={{
        height: 100,
        width: animWidth,
        backgroundColor: 'red',
      }}
      onTouchEnd={() => {
        animation.reset();
        animation.start();
      }}
    />
  );
}

const AnimatedScrollViewTestCase = () => {
  const scrollY = new Animated.Value(0);
  const translation = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 200],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={{
        width: '100%',
        height: 100,
        position: 'relative',
        overflow: 'hidden',
      }}>
      <Animated.ScrollView
        style={{width: '100%', height: '100%'}}
        contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {
            useNativeDriver: true,
          },
        )}>
        {new Array(3).fill(0).map((_, idx) => {
          return (
            <View
              key={idx}
              style={{
                width: '100%',
                height: 50,
                backgroundColor: 'gray',
                marginBottom: 50,
              }}
            />
          );
        })}
      </Animated.ScrollView>
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            transform: [{translateX: translation}],
            width: 32,
            height: 32,
            backgroundColor: 'red',
          },
        ]}
      />
    </View>
  );
};

function FadeInOut({nativeDriver = false}) {
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const handleFadePress = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: nativeDriver,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: nativeDriver,
      }),
    ]).start();
  };

  return (
    <Pressable onPress={handleFadePress}>
      <Animated.View
        style={{
          marginTop: 24,
          height: 100,
          width: 100,
          opacity: fadeAnim,
          backgroundColor: 'red',
        }}>
        <Text style={{width: 100, height: 48}}>
          Press me to fade{nativeDriver && ' using native driver'}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const Delay = () => {
  const square1Anim = useRef(new Animated.Value(0)).current;
  const square2Anim = useRef(new Animated.Value(0)).current;
  const animation = Animated.sequence([
    Animated.timing(square1Anim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }),
    Animated.delay(500),
    Animated.timing(square2Anim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }),
  ]);

  const handleAnimation = () => {
    animation.reset();
    animation.start();
  };

  return (
    <AnimatedRotatingSquaresView
      handleAnimation={handleAnimation}
      square1Anim={square1Anim}
      square2Anim={square2Anim}
    />
  );
};
const Loop = () => {
  const squareAnim = useRef(new Animated.Value(0)).current;
  const [isRunning, setIsRunning] = useState(false);
  const animation = Animated.loop(
    Animated.sequence([
      Animated.timing(squareAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(squareAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]),
  );

  const handleAnimation = () => {
    if (isRunning) {
      animation.stop();
      setIsRunning(false);
    } else {
      animation.reset();
      animation.start();
      setIsRunning(true);
    }
  };

  return (
    <AnimatedRotatingSquaresView
      handleAnimation={handleAnimation}
      square1Anim={squareAnim}
      square2Anim={new Animated.Value(0)}
    />
  );
};

const Parallel = () => {
  const square1Anim = useRef(new Animated.Value(0)).current;
  const square2Anim = useRef(new Animated.Value(0)).current;

  const animation = Animated.parallel([
    Animated.timing(square1Anim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }),
    Animated.timing(square2Anim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }),
  ]);
  const handleAnimation = () => {
    animation.reset();
    animation.start();
  };

  return (
    <AnimatedRotatingSquaresView
      handleAnimation={handleAnimation}
      square1Anim={square1Anim}
      square2Anim={square2Anim}
    />
  );
};

const AnimatedRotatingSquaresView = (props: {
  square1Anim: Animated.Value;
  square2Anim: Animated.Value;
  handleAnimation: () => void;
}) => {
  return (
    <Pressable
      style={{height: 100, width: '100%'}}
      onPress={props.handleAnimation}>
      <View style={{flexDirection: 'row'}}>
        <Animated.View
          style={{
            height: 50,
            width: 50,
            margin: 10,
            backgroundColor: 'red',
            transform: [
              {
                rotateZ: props.square1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          }}
        />
        <Animated.View
          style={{
            height: 50,
            width: 50,
            margin: 10,
            backgroundColor: 'grey',
            transform: [
              {
                rotateZ: props.square2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          }}
        />
      </View>
      <Text style={{height: 20}}>Press me to start animation</Text>
    </Pressable>
  );
};

const AnimatedPressableView = () => {
  const pressableAnim = useRef(new Animated.Value(0)).current;
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
  const animation = Animated.timing(pressableAnim, {
    toValue: 1,
    duration: 500,
    useNativeDriver: true,
  });
  const onPress = () => {
    animation.reset();
    animation.start();
  };
  return (
    <View style={{height: 80, width: '100%'}}>
      <AnimatedPressable
        style={{
          width: 100,
          margin: 20,
          backgroundColor: 'red',
          transform: [
            {
              rotateZ: pressableAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        }}
        onPress={onPress}>
        <Text style={{height: 40}}>Press me to start animation</Text>
      </AnimatedPressable>
    </View>
  );
};

const Spring = () => {
  const square1Anim = useRef(new Animated.Value(0)).current;
  const square2Anim = useRef(new Animated.Value(0)).current;

  const animation = Animated.parallel([
    Animated.spring(square1Anim, {
      toValue: 1,
      stiffness: 1,
      useNativeDriver: true,
    }),
    Animated.spring(square2Anim, {
      toValue: 1,
      mass: 20,
      useNativeDriver: true,
    }),
  ]);
  const handleAnimation = () => {
    animation.reset();
    animation.start();
  };

  return (
    <Pressable style={{height: 120, width: '100%'}} onPress={handleAnimation}>
      <Animated.View
        style={{
          height: 50,
          width: 50,
          backgroundColor: 'red',
          transform: [
            {
              rotateZ: square1Anim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        }}
      />
      <Animated.View
        style={{
          height: 50,
          width: 50,
          backgroundColor: 'grey',
          transform: [
            {
              rotateZ: square2Anim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        }}
      />
      <Text style={{height: 20}}>Press me to start animation</Text>
    </Pressable>
  );
};

const Decay = () => {
  const square1Anim = useRef(new Animated.Value(0)).current;
  const square2Anim = useRef(new Animated.Value(0)).current;

  const animation = Animated.parallel([
    Animated.decay(square1Anim, {
      velocity: 0.5,
      useNativeDriver: true,
    }),
    Animated.decay(square2Anim, {
      velocity: 0.25,
      // a deceleration value empirically determined to be _nice_
      deceleration: 0.99875,
      useNativeDriver: true,
    }),
  ]);
  const handleAnimation = () => {
    animation.reset();
    animation.start();
  };

  return (
    <Pressable style={{height: 120, width: '100%'}} onPress={handleAnimation}>
      <Animated.View
        style={{
          height: 50,
          width: 50,
          backgroundColor: 'red',
          transform: [
            {
              translateX: square1Anim,
            },
          ],
        }}
      />
      <Animated.View
        style={{
          height: 50,
          width: 50,
          backgroundColor: 'grey',
          transform: [
            {
              translateX: square2Anim,
            },
          ],
        }}
      />
      <Text style={{height: 20}}>Press me to start animation</Text>
    </Pressable>
  );
};

const Multiply = () => {
  const square1Anim = useRef(new Animated.Value(0)).current;
  const multValue = new Animated.Value(2);
  const squareMultAnim = Animated.multiply(square1Anim, multValue);

  const animation = Animated.timing(square1Anim, {
    toValue: 100,
    duration: 1000,
    useNativeDriver: true,
  });
  const handleAnimation = () => {
    animation.reset();
    animation.start();
  };

  return (
    <Pressable style={{height: 120, width: '100%'}} onPress={handleAnimation}>
      <Animated.View
        style={{
          height: 50,
          width: 50,
          backgroundColor: 'red',
          transform: [
            {
              translateX: square1Anim,
            },
          ],
        }}
      />
      <Animated.View
        style={{
          height: 50,
          width: 50,
          backgroundColor: 'grey',
          transform: [
            {
              translateX: squareMultAnim,
            },
          ],
        }}
      />
      <Text style={{height: 20}}>Press me to start animation</Text>
    </Pressable>
  );
};

const DiffClamp = () => {
  const square1Anim = useRef(new Animated.Value(0)).current;
  const clamped = Animated.diffClamp(square1Anim, 0, 50);
  const [direction, setDirection] = useState('left');

  const animation = React.useRef<Animated.CompositeAnimation>();

  const handleAnimation = () => {
    animation.current?.stop();
    animation.current = Animated.timing(square1Anim, {
      toValue: direction === 'left' ? 400 : 0,
      duration: 4000,
      useNativeDriver: true,
    });
    setDirection(direction === 'left' ? 'right' : 'left');
    animation.current.start();
  };

  return (
    <Pressable style={{width: '100%'}} onPress={handleAnimation}>
      <Animated.View
        style={{
          height: 50,
          width: 50,
          backgroundColor: 'red',
          transform: [
            {
              translateX: clamped,
            },
          ],
        }}
      />
      <Text style={{height: 20}}>Press me to start animation</Text>
    </Pressable>
  );
};

const ValueXY = () => {
  const square1Anim = useRef(new Animated.ValueXY({x: 50, y: 50})).current;

  const animation = Animated.sequence([
    Animated.timing(square1Anim, {
      toValue: {x: 0, y: 0},
      duration: 1000,
      useNativeDriver: true,
    }),
    Animated.timing(square1Anim, {
      toValue: {x: 0, y: 50},
      duration: 1000,
      useNativeDriver: true,
    }),
    Animated.timing(square1Anim, {
      toValue: {x: 50, y: 0},
      duration: 1000,
      useNativeDriver: true,
    }),
    Animated.timing(square1Anim, {
      toValue: {x: 50, y: 50},
      duration: 1000,
      useNativeDriver: true,
    }),
  ]);
  const handleAnimation = () => {
    animation.reset();
    animation.start();
  };

  return (
    <Pressable style={{height: 120, width: '100%'}} onPress={handleAnimation}>
      <View style={{height: 100}}>
        <Animated.View
          style={{
            height: 40,
            width: 40,
            backgroundColor: 'red',
            transform: [
              {
                translateX: square1Anim.x,
              },
              {
                translateY: square1Anim.y,
              },
            ],
          }}
        />
      </View>
      <Text style={{height: 20}}>Press me to start animation</Text>
    </Pressable>
  );
};

const AnimatedEndCallbackTest = () => {
  const [count, setCount] = React.useState(0);
  const increase = () => {
    Animated.timing(new Animated.Value(20), {
      toValue: 0,
      useNativeDriver: true,
      duration: 1000,
    }).start(() => {
      setCount(c => c + 1);
    });
  };

  return <Button onPress={increase} label={JSON.stringify(count)} />;
};

const TrackingValue = () => {
  const square1Anim = useRef(new Animated.Value(50)).current;
  const square2Anim = useRef(new Animated.Value(50)).current;

  const animation = Animated.sequence([
    Animated.timing(square1Anim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }),
    Animated.timing(square1Anim, {
      toValue: 50,
      duration: 1000,
      useNativeDriver: true,
    }),
    Animated.timing(square1Anim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }),
    Animated.timing(square1Anim, {
      toValue: 50,
      duration: 1000,
      useNativeDriver: true,
    }),
  ]);

  const handleAnimation = () => {
    animation.reset();
    animation.start();

    const tracking = Animated.spring(square2Anim, {
      toValue: square1Anim,
      useNativeDriver: true,
      mass: 10,
    });
    tracking.start();
  };

  return (
    <Pressable style={{height: 120, width: '100%'}} onPress={handleAnimation}>
      <View style={{height: 100}}>
        <Animated.View
          style={{
            height: 40,
            width: 40,
            backgroundColor: 'red',
            transform: [{translateX: square1Anim}],
          }}
        />
        <Animated.View
          style={{
            height: 40,
            width: 40,
            backgroundColor: 'blue',
            transform: [{translateX: square2Anim}],
          }}
        />
      </View>
      <Text style={{height: 20}}>Press me to start animation</Text>
    </Pressable>
  );
};

const Modulo = () => {
  const square1Anim = useRef(new Animated.Value(0)).current;
  const squareModuloAnim = Animated.modulo(square1Anim, 100);

  const animation = Animated.timing(square1Anim, {
    toValue: 199,
    duration: 1000,
    useNativeDriver: true,
  });
  const handleAnimation = () => {
    animation.reset();
    animation.start();
  };

  return (
    <Pressable style={{height: 120, width: '100%'}} onPress={handleAnimation}>
      <Animated.View
        style={{
          height: 50,
          width: 50,
          backgroundColor: 'red',
          transform: [
            {
              translateX: square1Anim,
            },
          ],
        }}
      />
      <Animated.View
        style={{
          height: 50,
          width: 50,
          backgroundColor: 'grey',
          transform: [
            {
              translateX: squareModuloAnim,
            },
          ],
        }}
      />
      <Text style={{height: 20}}>Press me to start animation</Text>
    </Pressable>
  );
};

const Perspective = () => {
  const square1Anim = useRef(new Animated.Value(500)).current;

  const animation = Animated.timing(square1Anim, {
    toValue: 50,
    duration: 1000,
    useNativeDriver: true,
  });
  const handleAnimation = () => {
    animation.reset();
    animation.start();
  };

  return (
    <Pressable style={{height: 120, width: '100%'}} onPress={handleAnimation}>
      <View style={{height: 100, justifyContent: 'center'}}>
        <Animated.View
          style={{
            height: 50,
            width: 50,
            backgroundColor: 'red',
            transform: [
              {
                rotateY: '60deg',
              },
              {
                perspective: square1Anim,
              },
            ],
          }}
        />
      </View>
      <Text style={{height: 20}}>Press me to start animation</Text>
    </Pressable>
  );
};
