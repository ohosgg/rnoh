import {Appearance, useColorScheme} from 'react-native';
import {TestSuite, TestCase} from '@rnoh/testerino';

export function UseColorSchemeTest() {
  const colorScheme = useColorScheme();
  const colorSchemeFromAppearance = Appearance.getColorScheme();

  return (
    <TestSuite name="useColorScheme">
      <TestCase
        itShould="return sensible value"
        fn={({expect}) => {
          expect(colorScheme).to.oneOf(['light', 'dark', null]);
        }}
      />
      <TestCase
        itShould="return equal value to Appearance.getColorScheme"
        fn={({expect}) => {
          expect(colorScheme).to.be.equal(colorSchemeFromAppearance);
        }}
      />
    </TestSuite>
  );
}
