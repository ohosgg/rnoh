import { Config } from '@react-native-community/cli-types';
import {
  commandBundleHarmony,
  commandPackHarmony,
  commandUnpackHarmony,
} from './commands';

export const config = {
  commands: [commandBundleHarmony, commandPackHarmony, commandUnpackHarmony],
} satisfies Partial<Config>;
