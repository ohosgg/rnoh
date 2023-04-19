import { Platform } from "react-native";
import { TestSuite, TestCase } from "../components";

export function PlatformConstantsTestSuite() {
  return <TestSuite name="PlatformConstants">
    <TestCase itShould="use 'harmony' as platform name" fn={({ expect }) => {
      expect(Platform.OS).to.be.eq("harmony");
    }} />
    <TestCase itShould="specify platform version" fn={({ expect }) => {
      expect(Platform.Version).to.include("OpenHarmony");
    }} />
    <TestCase itShould="not be running in tv mode" fn={({ expect }) => {
      expect(Platform.isTV).to.be.false;
    }} />
    <TestCase itShould="select Platform properly" fn={({ expect }) => {
      expect(Platform.select({ android: "a", ios: "i", native: "n", harmony: "h" })).to.be.eq("h");
    }} />
    <TestCase itShould="provide some RN version" fn={({ expect }) => {
      expect(Platform.constants.reactNativeVersion).to.be.not.empty;
    }} />
    <TestCase itShould="provide some value for isTesting" fn={({ expect }) => {
      expect(typeof Platform.constants.isTesting).to.be.eq("boolean");
    }} />
  </TestSuite>;
}
