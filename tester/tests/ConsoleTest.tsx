import {TestSuite, TestCase} from '@rnoh/testerino';
import {Button} from 'react-native';

const SEVERITIES = ['log', 'info', 'warn', 'error', 'debug'] as const;

export const ConsoleTest = () => {
  return (
    <TestSuite name="Console">
      {SEVERITIES.map(severity => (
        <TestCase itShould={`log message to console (${severity})`}>
          <Button
            title="log"
            onPress={() => console[severity](`console.${severity} test`)}
          />
        </TestCase>
      ))}
    </TestSuite>
  );
};
