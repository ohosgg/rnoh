import { Config } from '@react-native-community/cli-types';
import {
  commandBundleHarmony,
  commandPackHarmony,
  commandUnpackHarmony,
  commandCreateMetroConstantsHarmony,
} from './commands';

export const config = {
  commands: [
    commandBundleHarmony,
    commandPackHarmony,
    commandUnpackHarmony,
    commandCreateMetroConstantsHarmony,
  ],
} satisfies Partial<Config>;
