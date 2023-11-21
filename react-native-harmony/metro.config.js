//@ts-check
const pathUtils = require('path');
const fs = require('fs');
const colors = require('colors/safe');

/**
 * @param options {{reactNativeHarmonyPackageName: string} | undefined}
 * @returns {import("metro-config").InputConfigT}
 */
function createHarmonyMetroConfig(options) {
  const reactNativeHarmonyName =
    options?.reactNativeHarmonyPackageName ?? 'react-native-harmony';
  return {
    transformer: {
      assetRegistryPath: 'react-native/Libraries/Image/AssetRegistry',
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    resolver: {
      /** By default, Metro pickups files from native, "harmony" directory what causes conflicts.  */
      blockList: [/\\harmony\/.*/],
      resolveRequest: (ctx, moduleName, platform) => {
        if (platform === 'harmony') {
          if (moduleName === 'react-native') {
            return ctx.resolveRequest(ctx, reactNativeHarmonyName, platform);
          } else if (moduleName.startsWith('react-native/')) {
            return ctx.resolveRequest(ctx, moduleName, 'ios');
          } else if (
            isInternalReactNativeRelativeImport(ctx.originModulePath)
          ) {
            if (moduleName.startsWith('.')) {
              const moduleAbsPath = pathUtils.resolve(
                pathUtils.dirname(ctx.originModulePath),
                moduleName
              );
              const [_, modulePathRelativeToReactNative] = moduleAbsPath.split(
                `${pathUtils.sep}node_modules${pathUtils.sep}react-native${pathUtils.sep}`
              );
              try {
                return ctx.resolveRequest(
                  ctx,
                  `${reactNativeHarmonyName}${pathUtils.sep}${modulePathRelativeToReactNative}`,
                  'harmony'
                );
              } catch (err) {}
            }
            return ctx.resolveRequest(ctx, moduleName, 'ios');
          } else {
            /**
             * Replace `react-native-foo` with `react-native-harmony-foo` if a package has harmony directory and proper package.json configuration e.g.
             *
             * react-native-harmony-foo/package.json:
             *  "harmony": {
             *     "alias": "react-native-foo"
             *  }
             */
            const harmonyPackageNameByAlias = getHarmonyPackageNameByAlias('.');
            const alias = getPackageName(moduleName);
            if (alias) {
              const harmonyPackageName = harmonyPackageNameByAlias[alias];
              if (
                harmonyPackageName &&
                !isRequestFromHarmonyPackage(
                  ctx.originModulePath,
                  harmonyPackageName
                )
              ) {
                return ctx.resolveRequest(
                  ctx,
                  moduleName.replace(alias, harmonyPackageName),
                  platform
                );
              }
            }
          }
        }
        return ctx.resolveRequest(ctx, moduleName, platform);
      },
    },
  };
}

module.exports = {
  createHarmonyMetroConfig,
};

/**
 * @param moduleName {string}
 * @returns {string | null}
 */
function getPackageName(moduleName) {
  if (moduleName.startsWith('.')) return null;
  if (moduleName.startsWith('@')) {
    const segments = moduleName.split('/', 3);
    if (segments.length == 2) {
      return moduleName;
    } else if (segments.length > 2) {
      return `${segments[0]}/${segments[1]}`;
    }
    return null;
  }
  if (moduleName.includes('/')) {
    return moduleName.split('/')[0];
  } else {
    return moduleName;
  }
}

/**
 * @param originModulePath {string}
 * @returns {boolean}
 */
function isInternalReactNativeRelativeImport(originModulePath) {
  return originModulePath.includes(
    `${pathUtils.sep}node_modules${pathUtils.sep}react-native${pathUtils.sep}`
  );
}

/**
 * @param originModulePath {string}
 * @param harmonyPackageName {string}
 * @returns {boolean}
 */
function isRequestFromHarmonyPackage(originModulePath, harmonyPackageName) {
  return originModulePath.includes(
    `${pathUtils.sep}node_modules${pathUtils.sep}${harmonyPackageName}${pathUtils.sep}`
  );
}

/**
 * @type {Record<string, string> | undefined}
 */
let cachedHarmonyPackageAliasByName = undefined;

/**
 * @param projectRootPath {string}
 */
function getHarmonyPackageNameByAlias(projectRootPath) {
  /**
   * @type {Record<string, string>}
   */
  const initialAcc = {};
  if (cachedHarmonyPackageAliasByName) {
    return cachedHarmonyPackageAliasByName;
  }
  cachedHarmonyPackageAliasByName = findHarmonyNodeModulePaths(
    findHarmonyNodeModuleSearchPaths(projectRootPath)
  ).reduce((acc, harmonyNodeModulePath) => {
    const harmonyNodeModulePathSegments = harmonyNodeModulePath.split(
      pathUtils.sep
    );
    const harmonyNodeModuleName =
      harmonyNodeModulePathSegments[harmonyNodeModulePathSegments.length - 1];
    const packageJSONPath = `${harmonyNodeModulePath}${pathUtils.sep}package.json`;
    const packageJSON = readHarmonyModulePackageJSON(packageJSONPath);
    const alias = packageJSON.harmony?.alias;
    if (alias) {
      acc[alias] = harmonyNodeModuleName;
    }
    return acc;
  }, initialAcc);
  const harmonyPackagesCount = Object.keys(
    cachedHarmonyPackageAliasByName
  ).length;
  const infoPrefix = '[' + colors.bold(colors.cyan(`INFO`)) + ']';
  if (harmonyPackagesCount > 0) {
    const prettyHarmonyPackagesCount = colors.bold(
      harmonyPackagesCount > 0
        ? colors.red(harmonyPackagesCount.toString())
        : harmonyPackagesCount.toString()
    );
    console.log(
      infoPrefix,
      `Detected ${prettyHarmonyPackagesCount} harmony-specific third-party package(s):`
    );
    if (harmonyPackagesCount > 0) {
      Object.entries(cachedHarmonyPackageAliasByName).forEach(
        ([original, alias]) => {
          console.log(
            infoPrefix,
            `• ${colors.gray(original)} → ${colors.bold(alias)}`
          );
        }
      );
    }
  } else {
    console.log(
      infoPrefix,
      'No harmony specific third-party packages have been detected'
    );
  }
  console.log('');

  return cachedHarmonyPackageAliasByName;
}

/**
 * @param projectRootPath {string}
 * @returns {string[]}
 */
function findHarmonyNodeModuleSearchPaths(projectRootPath) {
  const nodeModulesPath = `${projectRootPath}${pathUtils.sep}node_modules`;
  const searchPaths = fs
    .readdirSync(nodeModulesPath)
    .filter((dirName) => dirName.startsWith('@'))
    .map((dirName) => `${nodeModulesPath}${pathUtils.sep}${dirName}`);
  searchPaths.push(nodeModulesPath);
  return searchPaths;
}

/**
 * @param searchPaths {string[]}
 * @returns {string[]}
 */
function findHarmonyNodeModulePaths(searchPaths) {
  return searchPaths
    .map((searchPath) => {
      return fs
        .readdirSync(searchPath)
        .map((dirName) => `${searchPath}${pathUtils.sep}${dirName}`)
        .filter(hasNodeModulePathHarmonyCode);
    })
    .flat();
}

/**
 * @param nodeModulePath {string}
 * @returns {boolean}
 */
function hasNodeModulePathHarmonyCode(nodeModulePath) {
  if (!fs.lstatSync(nodeModulePath).isDirectory()) return false;
  const nodeModuleContentNames = fs.readdirSync(nodeModulePath);
  return (
    nodeModuleContentNames.includes('harmony') ||
    nodeModuleContentNames.includes('harmony.tar.gz')
  );
}

/**
 * @param packageJSONPath {string}
 * @returns {{name: string, harmony?: {alias?: string}}}
 */
function readHarmonyModulePackageJSON(packageJSONPath) {
  return JSON.parse(fs.readFileSync(packageJSONPath).toString());
}
