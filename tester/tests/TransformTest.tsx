import {StyleSheet, Text, View} from 'react-native';
import {TestSuite, TestCase} from '@rnoh/testerino';

export function TransformTest() {
  return (
    <TestSuite name="Transform">
      <TestCase itShould="Show boxes with different scaling">
        <View style={styles.wrapper}>
          <View style={styles.box}>
            <Text style={styles.text}>Original Object</Text>
          </View>
          <View
            style={[
              styles.box,
              {
                transform: [{scale: 2}],
              },
            ]}>
            <Text style={styles.text}>Scale by 2</Text>
          </View>
          <View
            style={[
              styles.box,
              {
                transform: [{scaleX: 2}],
              },
            ]}>
            <Text style={styles.text}>ScaleX by 2</Text>
          </View>
          <View
            style={[
              styles.box,
              {
                transform: [{scaleY: 2}],
              },
            ]}>
            <Text style={styles.text}>ScaleY by 2</Text>
          </View>
        </View>
      </TestCase>
      <TestCase itShould="Show boxes with different rotations">
        <View style={styles.wrapper}>
          <View style={styles.box}>
            <Text style={styles.text}>Original Object</Text>
          </View>
          <View
            style={[
              styles.box,
              {
                transform: [{rotate: '45deg'}],
              },
            ]}>
            <Text style={styles.text}>Rotate by 45 deg</Text>
          </View>

          <View
            style={[
              styles.box,
              {
                transform: [{rotateX: '45deg'}, {rotateZ: '45deg'}],
              },
            ]}>
            <Text style={styles.text}>Rotate X&Z by 45 deg</Text>
          </View>

          <View
            style={[
              styles.box,
              {
                transform: [{rotateY: '45deg'}, {rotateZ: '45deg'}],
              },
            ]}>
            <Text style={styles.text}>Rotate Y&Z by 45 deg</Text>
          </View>
        </View>
      </TestCase>
      <TestCase itShould="Show boxes with different skews [fails]">
        <View style={styles.wrapper}>
          <View style={styles.box}>
            <Text style={styles.text}>Original Object</Text>
          </View>
          <View
            style={[
              styles.box,
              {
                transform: [{skewX: '45deg'}],
              },
            ]}>
            <Text style={styles.text}>SkewX by 45 deg</Text>
          </View>

          <View
            style={[
              styles.box,
              {
                transform: [{skewY: '45deg'}],
              },
            ]}>
            <Text style={styles.text}>SkewY by 45 deg</Text>
          </View>
          <View
            style={[
              styles.box,
              {
                transform: [{skewX: '30deg'}, {skewY: '30deg'}],
              },
            ]}>
            <Text style={styles.text}>Skew X&Y by 30 deg</Text>
          </View>
        </View>
      </TestCase>
      <TestCase itShould="Show boxes translated by 20 dp (half of box size)">
        <View style={styles.wrapper}>
          <View style={styles.box}>
            <Text style={styles.text}>Original Object</Text>
          </View>
          <View
            style={[
              styles.box,
              {
                transform: [{translateX: -20}],
              },
            ]}>
            <Text style={styles.text}>TranslateX by -20 </Text>
          </View>

          <View
            style={[
              styles.box,
              {
                transform: [{translateY: 20}],
              },
            ]}>
            <Text style={styles.text}>TranslateY by 20 </Text>
          </View>
        </View>
      </TestCase>
    </TestSuite>
  );
}
const styles = StyleSheet.create({
  box: {
    height: 40,
    width: 40,
    borderRadius: 5,
    marginHorizontal: 25,
    marginVertical: 25,
    backgroundColor: '#61dafb',
    justifyContent: 'center',
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  text: {
    fontSize: 6,
    margin: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    height: '100%',
  },
});
