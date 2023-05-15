# React Native Open Harmony

## Components diagram
![](./docs/react-native-open-harmony-app--components-diagram.png)


Note: native code lives in the `/tester/harmony/rnoh` directory to allow fast development cycles.

## Running `tester` app

1. Go to the `/tester`
1. Run `npm i`
1. Run `npm run dev`
1. Open `/tester/harmony` in DevEco Studio
1. Build and run entry module

## Running `tester` app using the Metro Bundler
1. Go to the `/tester`
1. Run `npm i`
1. Run `npm run dev`
1. Open `/tester/harmony` in DevEco Studio
1. Start the HarmonyOS emulator
1. Run `hdc rport tcp:8081 tcp:8081`
If `hdc` is not in your `PATH`, it can be found under `%USERPROFILE%/AppData/Local/Huawei/Sdk/hmscore/3.1.0/toolchains`
1. Start metro by running `npm run start`
1. Build and run entry module

## Creating NPM Package

1. Go to the `/react-native-harmony`
2. Run `npm run pack:prod`

Note: Creating NPM package may take a while. Package installation is also slow - it takes ~5 minutes.

## Related docs
[Platform Problems and Limitations](./docs/platform-problems-and-limitations.md)