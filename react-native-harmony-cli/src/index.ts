import { Config } from '@react-native-community/cli-types';
import {
  commandBundleHarmony,
  commandPrepareNativeModulesHarmony,
  commandPackHarmony,
  commandUnpackHarmony,
} from './commands';

export const config = {
  commands: [
    commandPrepareNativeModulesHarmony,
    commandBundleHarmony,
    commandPackHarmony,
    commandUnpackHarmony,
  ],
} satisfies Partial<Config>;
