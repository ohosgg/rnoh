import { Command } from '@react-native-community/cli-types';
import fs from 'fs';
import fse from 'fs-extra';
import Metro from 'metro';

export const commandBundleHarmony: Command = {
  name: 'bundle-harmony',
  description:
    'Creates JS bundle, creates a special cpp header containing the JS code, copies assets directory to the project.',
  func: async (argv, config, args) => {
    const metroConfig = await Metro.loadConfig();
    await Metro.runBuild(metroConfig, {
      entry: 'index.js',
      platform: 'harmony',
      minify: false,
      out: './bundle.harmony.js',
    });
    createHeaderFile(
      './bundle.harmony.js',
      './harmony/entry/src/main/cpp/jsbundle.h'
    );
    copyAssets('./assets/', './harmony/entry/src/main/ets/assets/assets');
  },
};

function copyAssets(srcPath: string, destPath: string) {
  if (fs.existsSync(srcPath)) {
    fse.copySync(srcPath, destPath, { overwrite: true });
    console.log(`[CREATED] ${destPath}`);
  }
}

function createHeaderFile(jsBundlePath: string, headerFilePath: string) {
  const jsBundle = fs.readFileSync(jsBundlePath, 'utf8');
  const content = generateHeaderContent(jsBundle);
  fs.writeFileSync(headerFilePath, content, 'utf8');
  console.log(`[CREATED] ${headerFilePath}`);
}

function generateHeaderContent(jsBundle: string) {
  return `#pragma once
#include <string>

constexpr const char *JS_BUNDLE = R"JSBUNDLE(${jsBundle})JSBUNDLE";`;
}
