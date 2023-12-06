import {TestSuite, TestCase} from '@rnoh/testerino';
import React, {useState, useEffect} from 'react';
import {Text, Appearance, ColorSchemeName} from 'react-native';
import {Button} from '../components';

export function AppearanceTest() {
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme(),
  );
  const [colorSchemeHistory, setColorSchemeHistory] = useState<
    ColorSchemeName[]
  >([Appearance.getColorScheme()]);

  useEffect(() => {
    const handleColorThemeChange = ({
      colorScheme: newColorScheme,
    }: {
      colorScheme: ColorSchemeName;
    }) => {
      setColorScheme(newColorScheme);
      setColorSchemeHistory(prev => [...prev, newColorScheme]);
    };

    Appearance.addChangeListener(handleColorThemeChange);
  }, []);

  return (
    <TestSuite name="Appearance">
      <TestCase
        itShould="return sensible value"
        fn={({expect}) => {
          expect(Appearance.getColorScheme()).to.oneOf(['light', 'dark', null]);
        }}
      />
      <TestCase itShould="show current colorScheme">
        <Button
          label="Toggle colorScheme"
          onPress={() => {
            if (colorScheme === 'light') {
              Appearance.setColorScheme('dark');
            } else if (colorScheme === 'dark') {
              Appearance.setColorScheme(null);
            } else {
              Appearance.setColorScheme('light');
            }
          }}
        />
        <Text>{colorScheme}</Text>
        <Text>
          {colorSchemeHistory
            .map(oldColorScheme => (oldColorScheme ? oldColorScheme : 'null'))
            .join(', ')}
        </Text>
      </TestCase>
    </TestSuite>
  );
}
