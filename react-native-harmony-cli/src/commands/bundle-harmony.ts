import { Command } from '@react-native-community/cli-types';
import fs from 'fs';
import fse from 'fs-extra';
import Metro from 'metro';

const ARK_RESOURCE_PATH = './harmony/entry/src/main/resources/rawfile';

export const commandBundleHarmony: Command = {
  name: 'bundle-harmony',
  description:
    'Creates JS bundle, creates a special cpp header containing the JS code, copies assets directory to the project.',
  options: [
    {
      name: '--prod',
      description: 'Warnings are disabled and the bundle is minified',
    },
    {
      name: '--entry-file <path>',
      description:
        'Path to the root JS file, either absolute or relative to JS root',
      default: 'index.js',
    },
  ],
  func: async (argv, config, args: any) => {
    const metroConfig = await Metro.loadConfig();
    await fse.ensureDir(ARK_RESOURCE_PATH);
    await Metro.runBuild(metroConfig, {
      entry: args.entryFile,
      platform: 'harmony',
      minify: false,
      out: ARK_RESOURCE_PATH + '/bundle.harmony.js',
      dev: args.prod ?? true,
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
