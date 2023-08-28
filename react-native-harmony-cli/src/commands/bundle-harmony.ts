import { Command } from '@react-native-community/cli-types';
import fs from 'fs';
import fse from 'fs-extra';
import Metro from 'metro';

const ARK_RESOURCE_PATH = './harmony/entry/src/main/resources/rawfile';
const ASSETS_DEFAULT_DEST_PATH = './harmony/entry/src/main/ets/assets/assets';

export const commandBundleHarmony: Command = {
  name: 'bundle-harmony',
  description:
    'Creates JS bundle, creates a special cpp header containing the JS code, copies assets directory to the project.',
  options: [
    {
      name: '--dev',
      description: 'If false, warnings are disabled and the bundle is minified',
      default: 'true',
    },
    {
      name: '--entry-file <path>',
      description:
        'Path to the root JS file, either absolute or relative to JS root',
      default: 'index.js',
    },
    {
      name: '--config <path>',
      description: 'Path to the Metro configuration file',
    },
    {
      name: '--bundle-output <path>',
      description: 'File name where to store the resulting bundle, ex. /tmp/groups.bundle',
      default: ARK_RESOURCE_PATH + '/bundle.harmony.js',
    },
    {
      name: '--assets-dest <path>',
      description: 'Directory name where to store assets referenced in the bundle',
      default: ASSETS_DEFAULT_DEST_PATH,
    },
    {
      name: '--sourcemap-output <path>',
      description: 'File name where to store the resulting source map, ex. /tmp/groups.map',
    },
  ],
  func: async (argv, config, args: any) => {
    const metroConfig = (args.config ) ? await Metro.loadConfig(args.config) : await Metro.loadConfig();
    if (args.bundleOutput === ARK_RESOURCE_PATH + '/bundle.harmony.js') {
      await fse.ensureDir(ARK_RESOURCE_PATH);
    }

    // casting needed as Metro.runBuild returns Promise<{code: string, map: string}> 
    // despite being typed as Promise<void> 
    ((Metro.runBuild(metroConfig, {
      entry: args.entryFile,
      platform: 'harmony',
      minify: false,
      dev: args.dev ?? true,    
      sourceMap: args.sourcemapOutput,
    }) as unknown) as Promise<{code: string, map:string}>).then((bundle) => {
      saveBundle(bundle, args.bundleOutput, args.sourcemapOutput)
      copyAssets('./assets/', args.assetsDest);
    });
  },
};

function saveBundle(bundle: {code: string, map: string}, bundleOutput: string, sourceMapOutput: string | undefined) {
    fs.writeFileSync(bundleOutput, bundle.code);
    console.log(`[CREATED] ${bundleOutput}`);

    if (sourceMapOutput) {
      fs.writeFileSync(sourceMapOutput, bundle.map);
      console.log(`[CREATED] ${sourceMapOutput}`);
    }
} 

function copyAssets(srcPath: string, destPath: string) {
  if (fs.existsSync(srcPath)) {
    fse.copySync(srcPath, destPath, { overwrite: true });
    console.log(`[CREATED] ${destPath}`);
  }
}
