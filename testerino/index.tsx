import {
  FC,
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { expect as expect_, AssertionError } from 'chai'

const PALETTE = {
  red: '#f98e7d',
  yellow: '#d2a535',
  green: '#63c034',
  gray: '#aaa',
}

const defaultTestingSummary = {
  total: 0,
  pass: 0,
  fail: 0,
  broken: 0,
  visual: 0,
}

type TestCaseResultType = 'pass' | 'fail' | 'broken' | 'visual'

const TestingContext = createContext<
  | undefined
  | {
      registerTestCase: () => void
      reportTestCaseResult: (result: TestCaseResultType) => void
    }
>(undefined)

export const Tester: FC<{ children: any }> = ({ children }) => {
  const [testingSummary, setTestingSummary] = useState(defaultTestingSummary)

  const registerTestCase = useCallback(() => {
    setTestingSummary((prev) => ({ ...prev, total: prev.total + 1 }))
  }, [])

  const reportTestCaseResult = useCallback((result: TestCaseResultType) => {
    setTestingSummary((prev) => ({ ...prev, [result]: prev[result] + 1 }))
  }, [])

  return (
    <TestingContext.Provider value={{ registerTestCase, reportTestCaseResult }}>
      <View style={styles.testerContainer}>
        <View style={styles.summaryContainer}>
          <SummaryItem
            name='TOTAL'
            color={'white'}
            value={testingSummary.total}
          />
          <SummaryItem
            name='RUNNING'
            color={PALETTE.red}
            value={
              testingSummary.total -
              (testingSummary.pass +
                testingSummary.fail +
                testingSummary.visual +
                testingSummary.broken)
            }
          />
          <SummaryItem
            name='PASS'
            color={PALETTE.green}
            value={testingSummary.pass}
          />
          <SummaryItem
            name='VISUAL'
            color={PALETTE.yellow}
            value={testingSummary.visual}
          />
          <SummaryItem
            name='FAIL'
            color={PALETTE.red}
            value={testingSummary.fail}
          />
          <SummaryItem
            name='BROKEN'
            color={PALETTE.red}
            value={testingSummary.broken}
          />
        </View>
        {children}
      </View>
    </TestingContext.Provider>
  )
}

const SummaryItem: FC<{
  name: string
  color: string
  value: number
}> = ({ name, color, value }) => {
  return (
    <View style={styles.summaryItemContainer}>
      <Text
        style={[
          styles.summaryItemValue,
          { color: value > 0 ? color : PALETTE.gray },
        ]}
      >
        {value}
      </Text>
      <Text style={styles.summaryItemName}>{name}</Text>
    </View>
  )
}

export const TestSuite: FC<{ name: string; children: any }> = ({
  name,
  children,
}) => {
  return (
    <View style={styles.testSuiteContainer}>
      <Text style={styles.testSuiteHeader}>{name}</Text>
      {children}
    </View>
  )
}

export const TestCase: FC<
  { itShould: string } & (
    | { children: any }
    | { fn: (utils: { expect: typeof expect_ }) => Promise<void> | void }
  )
> = ({ itShould, ...otherProps }) => {
  const isVisualTest = 'children' in otherProps
  const { registerTestCase } = useContext(TestingContext)!
  useEffect(() => {
    registerTestCase()
  }, [])

  if (isVisualTest) {
    return (
      <VisualTestCase name={itShould}>{otherProps.children}</VisualTestCase>
    )
  }
  return <LogicalTestCase name={itShould} fn={otherProps['fn']} />
}

const VisualTestCase: FC<{ name: string; children: any }> = ({
  name,
  children,
}) => {
  const { reportTestCaseResult } = useContext(TestingContext)!

  useEffect(() => {
    reportTestCaseResult('visual')
  }, [])

  return (
    <TestCaseStateTemplate
      name={name}
      renderStatusLabel={() => (
        <Text style={[styles.testCaseStatus, { color: PALETTE.yellow }]}>
          {'MANUAL'}
        </Text>
      )}
      renderDetails={() => (
        <View style={styles.visualTestContainer}>{children}</View>
      )}
    />
  )
}

type RunningTestCaseState = {
  status: 'running'
}

type PassTestCaseState = {
  status: 'pass'
}

type FailTestCaseState = {
  status: 'fail'
  message: string
}

type BrokenTestCaseState = {
  status: 'broken'
  message: string
}

type TestCaseState =
  | RunningTestCaseState
  | PassTestCaseState
  | FailTestCaseState
  | BrokenTestCaseState

export const LogicalTestCase: FC<{
  name: string
  fn: (utils: { expect: typeof expect_ }) => Promise<void> | void
}> = ({ name, fn }) => {
  const [result, setResult] = useState<TestCaseState>({ status: 'running' })
  const { reportTestCaseResult } = useContext(TestingContext)!

  useEffect(() => {
    ;(async () => {
      try {
        setResult({ status: 'running' })
        await fn({ expect: expect_ })
        setResult({ status: 'pass' })
        reportTestCaseResult('pass')
      } catch (err) {
        if (err instanceof AssertionError) {
          setResult({ status: 'fail', message: err.message })
          reportTestCaseResult('fail')
        } else if (err instanceof Error) {
          setResult({ status: 'broken', message: err.message })
          reportTestCaseResult('broken')
        } else {
          setResult({ status: 'broken', message: '' })
          reportTestCaseResult('broken')
        }
      }
    })()
  }, [])

  return <TestCaseStateComponent name={name} result={result} />
}

const TestCaseStateComponent: FC<{ name: string; result: TestCaseState }> = ({
  name,
  result,
}) => {
  if (result.status === 'broken') {
    return <BrokenTestCaseStateComponent name={name} result={result} />
  } else if (result.status === 'pass') {
    return <PassTestCaseStateComponent name={name} />
  } else if (result.status === 'fail') {
    return <FailTestCaseStateComponent name={name} result={result} />
  } else if (result.status === 'running') {
    return <RunningTestCaseStateComponent name={name} />
  } else {
    return (
      <BrokenTestCaseStateComponent
        name={name}
        result={{ status: 'broken', message: 'Unknown status' }}
      />
    )
  }
}

const PassTestCaseStateComponent: FC<{
  name: string
}> = ({ name }) => {
  return (
    <TestCaseStateTemplate
      name={name}
      renderStatusLabel={() => (
        <Text style={[styles.testCaseStatus, { color: PALETTE.green }]}>
          {'PASS'}
        </Text>
      )}
    />
  )
}

const FailTestCaseStateComponent: FC<{
  name: string
  result: FailTestCaseState
}> = ({ name, result }) => {
  return (
    <TestCaseStateTemplate
      name={name}
      renderStatusLabel={() => (
        <Text style={[styles.testCaseStatus, { color: PALETTE.red }]}>
          {'FAIL'}
        </Text>
      )}
      renderDetails={() => (
        <Text style={[styles.textDetails, { color: PALETTE.red }]}>
          {result.message}
        </Text>
      )}
    />
  )
}

const BrokenTestCaseStateComponent: FC<{
  name: string
  result: BrokenTestCaseState
}> = ({ name, result }) => {
  return (
    <TestCaseStateTemplate
      name={name}
      renderStatusLabel={() => (
        <Text style={[styles.testCaseStatus, { color: PALETTE.red }]}>
          {'BROKEN'}
        </Text>
      )}
      renderDetails={() => (
        <Text style={[styles.textDetails, { color: PALETTE.red }]}>
          {result.message}
        </Text>
      )}
    />
  )
}

const RunningTestCaseStateComponent: FC<{
  name: string
}> = ({ name }) => {
  return (
    <TestCaseStateTemplate
      name={name}
      renderStatusLabel={() => (
        <Text style={styles.testCaseStatus}>{'RUNNING...'}</Text>
      )}
    />
  )
}

const TestCaseStateTemplate: FC<{
  name: string
  renderStatusLabel: () => any
  renderDetails?: () => any
}> = ({ name, renderDetails, renderStatusLabel }) => {
  return (
    <View style={styles.testCaseContainer}>
      <View style={styles.testCaseHeaderContainer}>
        <Text style={styles.testCaseHeader}>{name}</Text>
        {renderStatusLabel && renderStatusLabel()}
      </View>
      {renderDetails && renderDetails()}
    </View>
  )
}

const styles = StyleSheet.create({
  testerContainer: {
    backgroundColor: '#222',
  },
  testSuiteContainer: {
    padding: 8,
  },
  testCaseContainer: {},
  testCaseHeaderContainer: {
    width: '100%',
    height: 24,
    display: 'flex',
    flexDirection: 'row',
  },
  visualTestContainer: {
    borderWidth: 4,
    borderColor: '#666',
    backgroundColor: 'white',
  },
  textDetails: {
    width: '100%',
    height: 16,
    fontSize: 10,
    color: 'white',
    marginBottom: 16,
  },
  testSuiteHeader: {
    width: '100%',
    height: 24,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EEE',
  },
  testCaseHeader: {
    flex: 1,
    height: '100%',
    fontSize: 12,
    color: '#EEE',
  },
  testCaseStatus: {
    width: 72,
    height: '100%',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#AAA',
  },
  summaryContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    padding: 8,
  },
  summaryItemContainer: {
    flex: 1,
    height: 64,
  },
  summaryItemValue: {
    color: 'white',
    fontSize: 20,
    width: '100%',
    height: 24,
    fontWeight: 'bold',
  },
  summaryItemName: {
    color: PALETTE.gray,
    width: '100%',
    height: 16,
    fontSize: 12,
    fontWeight: 'bold',
  },
})
