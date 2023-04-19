import { FC, useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { expect as expect_, AssertionError } from "chai";


export const Tester: FC<{ children: any; }> = ({ children }) => {
  return <View style={styles.testerContainer}>{children}</View>;
};

export const TestSuite: FC<{ name: string, children: any; }> = ({ name, children }) => {
  return <View style={styles.testSuiteContainer}>
    <Text style={styles.textLine}>{name}</Text>
    {children}
  </View>;
};


export const TestCase: FC<{ itShould: string; } & ({ children: any; } | { fn: (utils: { expect: typeof expect_; }) => (Promise<void> | void); })> = ({ itShould, ...otherProps }) => {
  const isVisualTest = "children" in otherProps;

  return <View style={styles.testCaseContainer}>
    <Text style={styles.textLine}>{itShould}</Text>
    {isVisualTest ? <View style={styles.visualTestContainer}>{otherProps["children"]}</View> : <LogicalTestCase fn={otherProps["fn"]} />}
  </View>;
};


type RunningTestCaseState = {
  status: "running";
};

type PassTestCaseState = {
  status: "pass";
};

type FailTestCaseState = {
  status: "fail";
  message: string;
};

type BrokenTestCaseState = {
  status: "broken";
  message: string;
};

type TestCaseState = RunningTestCaseState | PassTestCaseState | FailTestCaseState | BrokenTestCaseState;


export const LogicalTestCase: FC<{ fn: (utils: { expect: typeof expect_; }) => (Promise<void> | void); }> = ({ fn }) => {
  const [result, setResult] = useState<TestCaseState>({ status: "running" });

  useEffect(() => {
    (async () => {
      try {
        setResult({ status: "running" });
        await fn({ expect: expect_ });
        setResult({ status: "pass" });
      }
      catch (err) {
        if (err instanceof AssertionError) {
          setResult({ status: "fail", message: err.message });
        } else if (err instanceof Error) {
          setResult({ status: "broken", message: err.message });
        } else {
          setResult({ status: "broken", message: "" });
        }
      }
    })();

  }, []);

  return <Text style={styles.textLine}>{JSON.stringify(result)}</Text>;
};


export const TestingExample = () => {
  return <Tester>
    <TestSuite name="Testing example">
      <TestCase itShould="render red square">
        <View style={{ backgroundColor: "red", width: 100, height: 100 }} />
      </TestCase>
      <TestCase itShould="pass" fn={({ expect }) => {
        expect("foo").to.be.eq("foo");
      }} />
      <TestCase itShould="fail" fn={({ expect }) => {
        expect("foo").to.be.eq("bar");
      }} />
    </TestSuite>
  </Tester>;
};

const styles = StyleSheet.create({
  testerContainer: {
    backgroundColor: "white"
  },
  testSuiteContainer: {
    padding: 8,
  },
  testCaseContainer: {
    padding: 8,
  },
  visualTestContainer: {
    borderWidth: 1,
    borderColor: "purple"
  },
  textLine: {
    width: "100%",
    height: 16,
    fontSize: 8
  },
});