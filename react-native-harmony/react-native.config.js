const fs = require("fs");
const fse = require("fs-extra");
const pathUtils = require("path");
const Metro = require("metro");

/**
 * @type {import("@react-native-community/cli-types").Config}
 */
const config = {
  commands: [{
    name: "prepare-native-modules-harmony",
    description: "Copies native modules from node_modules to the project directory.",
    func: (argv, config, args) => {
      copyHarmonyModules(config.root);
    },
  },
  {
    name: "bundle-harmony",
    description: "Creates JS bundle, creates a special cpp header containing the JS code, copies assets directory to the project.",
    func: async (argv, config, args) => {
      const metroConfig = await Metro.loadConfig();
      await Metro.runBuild(metroConfig, {
        entry: 'index.js',
        platform: 'harmony',
        minify: false,
        out: './bundle.harmony.js'
      });
      createHeaderFile("./bundle.harmony.js", "./harmony/entry/src/main/cpp/jsbundle.h");
      copyAssets("./assets/", "./harmony/entry/src/main/ets/assets/assets");
    },
  }],
};

module.exports = config;

function copyHarmonyModules(projectRootPath) {
  forEachNodeModule(pathUtils.join(projectRootPath, "node_modules"), (path) => {
    const nodeModuleHarmonyPath = getHarmonyModulePathIfExists(path);

    if (nodeModuleHarmonyPath) {
      copyHarmonyModuleToHarmonyProject(projectRootPath, nodeModuleHarmonyPath, pathUtils.join(projectRootPath, "harmony"));
    }
  });
}

function forEachNodeModule(nodeModulesPath, cb) {
  const nodeModuleNames = fs.readdirSync(nodeModulesPath);
  for (const nodeModuleName of nodeModuleNames) {
    cb(pathUtils.join(nodeModulesPath, nodeModuleName));
  }
}

function getHarmonyModulePathIfExists(nodeModulePath) {
  const harmonyProjectPath = pathUtils.join(nodeModulePath, "harmony");
  if (fs.existsSync(harmonyProjectPath)) {
    return harmonyProjectPath;
  } else {
    return null;
  }
}

function copyHarmonyModuleToHarmonyProject(projectRootPath, harmonyModulePath, harmonyProjectPath) {
  const outputDirPath = pathUtils.join(harmonyProjectPath, "react_native_modules");
  fse.copySync(harmonyModulePath, outputDirPath, { overwrite: true });
  fs.readdirSync(harmonyModulePath).forEach((filePath) => {
    console.log(`[CREATED] ${pathUtils.relative(projectRootPath, pathUtils.join(outputDirPath, filePath))}`);
  });
}

function copyAssets(srcPath, destPath) {
  fse.copySync(srcPath, destPath, { overwrite: true });
  console.log(`[CREATED] ${destPath}`);
}

function createHeaderFile(jsBundlePath, headerFilePath) {
  const jsBundle = fs.readFileSync(jsBundlePath, 'utf8');
  const content = generateHeaderContent(jsBundle);
  fs.writeFileSync(headerFilePath, content, 'utf8');
  console.log(`[CREATED] ${headerFilePath}`);
};

function generateHeaderContent(jsBundle) {
  return `#pragma once
#include <string>

constexpr const char *JS_BUNDLE = R"JSBUNDLE(${jsBundle})JSBUNDLE";`;
};
