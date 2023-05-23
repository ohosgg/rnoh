import { Config } from '@react-native-community/cli-types';
import {
  commandBundleHarmony,
  commandPrepareNativeModulesHarmony,
} from './commands';

export const config: Partial<Config> = {
  commands: [commandPrepareNativeModulesHarmony, commandBundleHarmony],
};
