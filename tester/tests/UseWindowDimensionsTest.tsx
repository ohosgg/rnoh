import {useWindowDimensions} from 'react-native';
import {TestSuite, TestCase} from '@rnoh/testerino';

export function UseWindowDimensionsTest() {
    const {height, width, scale, fontScale} = useWindowDimensions();

  return (
    <TestSuite name="useWindowDimensions">
      <TestCase
        itShould="return width used in emulator (409.3)"
        fn={({expect}) => {
            expect(width).to.be.closeTo(409.3, 0.1);
          }}
      />
      <TestCase
        itShould="return height used in emulator (820.6)"
        fn={({expect}) => {
            expect(height).to.be.closeTo(820.6, 0.1);
          }}
      />
      <TestCase
        itShould="return scale used in emulator (3)"
        fn={({expect}) => {
            expect(scale).to.be.eq(3);
          }}
      />
      <TestCase
        itShould="return font scale used in emulator (1)"
        fn={({expect}) => {
            expect(fontScale).to.be.eq(1);
          }}
      />
    </TestSuite>
  );
}