import React from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TestCase, TestSuite } from '@rnoh/testerino';

export function PressableTest() {
    return (
        <TestSuite name="Pressable">
            <TestCase itShould="handle press">
                <PressableView />
            </TestCase>
        </TestSuite>
    );
}

function PressableView() {
    const [pressed, setPressed] = React.useState(0);
    const [pressCounter, setPressCounter] = React.useState(0);

    const STYLE_LIST = [styles.unpressed, styles.pressed, styles.longPressed];

    const incrementPressCounter = () => { setPressCounter(count => count + 1) }

    return (
        <View>
            <Pressable
                onPressIn={() => setPressed(1)}
                onLongPress={() => setPressed(2)}
                onPressOut={() => setPressed(0)}
                onPress={incrementPressCounter}
            >
                <View style={STYLE_LIST[pressed]} />
            </Pressable>
            <Text style={styles.text}>
                Pressed {pressCounter} times
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    unpressed: {
        width: 100,
        height: 100,
        backgroundColor: 'red',
    },
    pressed: {
        width: 200,
        height: 100,
        backgroundColor: 'blue',
    },
    longPressed: {
        width: 300,
        height: 100,
        backgroundColor: 'green',
    },
    text: {
        height: 20,
        width: 200,
        fontSize: 14,
    }
})
