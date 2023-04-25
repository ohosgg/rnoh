const fs = require("fs");
const fse = require("fs-extra");
const pathUtils = require("path");

/**
 * @type {import("@react-native-community/cli-types").Config}
 */
const config = {
  commands: [{
    name: "postinstall",
    func: (argv, config, args) => {
      handlePostInstall(config.root);
    },
  }],
};

module.exports = config;

function handlePostInstall(projectRootPath) {
  forEachNodeModule(pathUtils.join(projectRootPath, "node_modules"), (path) => {
    const nodeModuleHarmonyPath = getHarmonyModulePathIfExists(path);

    if (nodeModuleHarmonyPath) {
      console.log(`Copying ${path}`);
      moveHarmonyModuleToHarmonyProject(nodeModuleHarmonyPath, pathUtils.join(projectRootPath, "harmony"));
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

function moveHarmonyModuleToHarmonyProject(harmonyModulePath, harmonyProjectPath) {
  fse.copySync(harmonyModulePath, pathUtils.join(harmonyProjectPath, "react_native_modules"), { overwrite: true });
}