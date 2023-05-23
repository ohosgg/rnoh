import pathUtils from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import { Command } from '@react-native-community/cli-types';

export const commandPrepareNativeModulesHarmony: Command = {
  name: 'prepare-native-modules-harmony',
  description:
    'Copies native modules from node_modules to the project directory.',
  func: (argv, config, args) => {
    copyHarmonyModules(config.root);
  },
};

function copyHarmonyModules(projectRootPath: string) {
  forEachNodeModule(pathUtils.join(projectRootPath, 'node_modules'), (path) => {
    const nodeModuleHarmonyPath = getHarmonyModulePathIfExists(path);

    if (nodeModuleHarmonyPath) {
      copyHarmonyModuleToHarmonyProject(
        projectRootPath,
        nodeModuleHarmonyPath,
        pathUtils.join(projectRootPath, 'harmony')
      );
    }
  });
}

function forEachNodeModule(
  nodeModulesPath: string,
  cb: (nodeModulePath: string) => void
) {
  const nodeModuleNames = fs.readdirSync(nodeModulesPath);
  for (const nodeModuleName of nodeModuleNames) {
    cb(pathUtils.join(nodeModulesPath, nodeModuleName));
  }
}

function getHarmonyModulePathIfExists(nodeModulePath: string) {
  const harmonyProjectPath = pathUtils.join(nodeModulePath, 'harmony');
  if (fs.existsSync(harmonyProjectPath)) {
    return harmonyProjectPath;
  } else {
    return null;
  }
}

function copyHarmonyModuleToHarmonyProject(
  projectRootPath: string,
  harmonyModulePath: string,
  harmonyProjectPath: string
) {
  const outputDirPath = pathUtils.join(
    harmonyProjectPath,
    'react_native_modules'
  );
  fse.copySync(harmonyModulePath, outputDirPath, { overwrite: true });
  fs.readdirSync(harmonyModulePath).forEach((filePath) => {
    console.log(
      `[CREATED] ${pathUtils.relative(
        projectRootPath,
        pathUtils.join(outputDirPath, filePath)
      )}`
    );
  });
}
