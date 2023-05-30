import React from 'react';
import {StyleSheet, View, ViewProps} from 'react-native';

export function DeepTree({
  breadth,
  depth,
  id,
  wrap,
}: {
  breadth: number;
  depth: number;
  id: number;
  wrap: number;
}) {
  let result = (
    <Box color={id % 3} layout={depth % 2 === 0 ? 'row' : 'column'} outer>
      {depth === 0 && <Box color={(id % 3) + 3} fixed />}
      {depth !== 0 &&
        Array.from({length: breadth}).map((el, i) => (
          <DeepTree
            breadth={breadth}
            depth={depth - 1}
            id={i}
            key={i}
            wrap={wrap}
          />
        ))}
    </Box>
  );
  for (let i = 0; i < wrap; i++) {
    result = <Box>{result}</Box>;
  }
  return result;
}

const Box = ({
  color = -1,
  fixed = false,
  layout = 'column',
  outer = false,
  ...other
}: ViewProps & {
  color?: number;
  fixed?: boolean;
  layout?: 'column' | 'row';
  outer?: boolean;
}) => (
  <View
    {...other}
    style={[
      color === -1 ? undefined : styles[`color${color}` as keyof typeof styles],
      fixed && styles.fixed,
      layout === 'row' && styles.row,
      outer && styles.outer,
    ]}
  />
);

const styles = StyleSheet.create({
  outer: {
    alignSelf: 'flex-start',
    padding: 2,
  },
  row: {
    flexDirection: 'row',
  },
  color0: {
    backgroundColor: '#14171A',
  },
  color1: {
    backgroundColor: '#AAB8C2',
  },
  color2: {
    backgroundColor: '#E6ECF0',
  },
  color3: {
    backgroundColor: '#FFAD1F',
  },
  color4: {
    backgroundColor: '#F45D22',
  },
  color5: {
    backgroundColor: '#E0245E',
  },
  fixed: {
    width: 4,
    height: 4,
  },
});

export default Box;
