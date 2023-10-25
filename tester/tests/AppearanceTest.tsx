import { TestSuite, TestCase } from '@rnoh/testerino';
import React, { useState, useEffect } from 'react';
import { Text, Appearance, ColorSchemeName } from 'react-native';
import { Button } from '../components';

export function AppearanceTest() {
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());
  const [colorSchemeHistory, setColorSchemeHistory] = useState<ColorSchemeName[]>([Appearance.getColorScheme()]);

  useEffect(() => {
    const handleColorThemeChange = ({ colorScheme }: { colorScheme: ColorSchemeName }) => {
      setColorScheme(colorScheme);
      setColorSchemeHistory(prev => [...prev, colorScheme]);
    };

    Appearance.addChangeListener(handleColorThemeChange);
  }, []);

  return (
    <TestSuite name="Appearance">
      <TestCase
        itShould="return sensible value"
        fn={({ expect }) => {
          expect(Appearance.getColorScheme()).to.oneOf(['light', 'dark', null]);
        }}
      />
      <TestCase itShould="show current colorScheme">
        <Button label='Toggle colorScheme' onPress={() => {
          if (colorScheme === 'light') {
            Appearance.setColorScheme('dark');
          } else if (colorScheme === 'dark') {
            Appearance.setColorScheme(null);
          } else {
            Appearance.setColorScheme('light');
          }
        }} />
        <Text>{colorScheme}</Text>
        <Text>{colorSchemeHistory.map((colorScheme) => colorScheme ? colorScheme : 'null').join(', ')}</Text>
      </TestCase>
    </TestSuite>
  );
}