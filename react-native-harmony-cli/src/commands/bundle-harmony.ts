import { Command } from '@react-native-community/cli-types';
import fs from 'fs';
import fse from 'fs-extra';
import Metro from 'metro';

const ARK_RESOURCE_PATH = './harmony/entry/src/main/resources/rawfile';

export const commandBundleHarmony: Command = {
  name: 'bundle-harmony',
  description:
    'Creates JS bundle, creates a special cpp header containing the JS code, copies assets directory to the project.',
  func: async (argv, config, args) => {
    const metroConfig = await Metro.loadConfig();
    await fse.ensureDir(ARK_RESOURCE_PATH);
    await Metro.runBuild(metroConfig, {
      entry: 'index.js',
      platform: 'harmony',
      minify: false,
      out: ARK_RESOURCE_PATH+'/bundle.harmony.js',
    });
    copyAssets('./assets/', './harmony/entry/src/main/ets/assets/assets');
  },
};

function copyAssets(srcPath: string, destPath: string) {
  if (fs.existsSync(srcPath)) {
    fse.copySync(srcPath, destPath, { overwrite: true });
    console.log(`[CREATED] ${destPath}`);
  }
}
