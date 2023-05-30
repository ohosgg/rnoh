import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  interpolatePurples,
  interpolateBuPu,
  interpolateRdPu,
} from 'd3-scale-chromatic';

const targetSize = 10;

export function SierpinskiTriangle({
  s,
  depth,
  renderCount,
  x,
  y,
}: {
  depth: number;
  renderCount: number;
  x: number;
  y: number;
  s: number;
}) {
  if (s <= targetSize) {
    let fn;
    switch (depth) {
      case 1:
        fn = interpolatePurples;
        break;
      case 2:
        fn = interpolateBuPu;
        break;
      case 3:
      default:
        fn = interpolateRdPu;
    }

    // introduce randomness to ensure that repeated runs don't produce the same colors
    const color = fn((renderCount * Math.random()) / 20);
    return (
      <Dot
        color={color}
        size={targetSize}
        x={x - targetSize / 2}
        y={y - targetSize / 2}
      />
    );
  }

  s /= 2;

  return (
    <React.Fragment>
      <SierpinskiTriangle
        depth={1}
        renderCount={renderCount}
        s={s}
        x={x}
        y={y - s / 2}
      />
      <SierpinskiTriangle
        depth={2}
        renderCount={renderCount}
        s={s}
        x={x - s}
        y={y + s / 2}
      />
      <SierpinskiTriangle
        depth={3}
        renderCount={renderCount}
        s={s}
        x={x + s}
        y={y + s / 2}
      />
    </React.Fragment>
  );
}

function Dot({
  size,
  x,
  y,
  color,
}: {
  size: number;
  x: number;
  y: number;
  color: string;
}) {
  return (
    <View
      style={[
        styles.root,
        {
          // borderColor: color,
          // borderRightWidth: size / 2,
          // borderBottomWidth: size / 2,
          // borderLeftWidth: size / 2,
          width: size / 2,
          height: size / 2,
          backgroundColor: color,
          marginLeft: x,
          marginTop: y,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    cursor: 'pointer',
    width: 0,
    height: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 0,
    // transform: [{ translateX: '50%' }, { translateY: '50%' }]
  },
});
