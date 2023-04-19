/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const pathUtils = require('path');


function isInternalReactNativeRelativeImport(originModulePath) {
  return originModulePath.includes(`${pathUtils.sep}node_modules${pathUtils.sep}react-native${pathUtils.sep}`);
}

/**
 * @type {import("@types/metro-config").ConfigT}
 */
module.exports = {
  transformer: {
    assetRegistryPath: "react-native/Libraries/Image/AssetRegistry",
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    resolveRequest: (ctx, moduleName, platform) => {
      if (platform === "harmony") {
        if (moduleName === "react-native") {
          return ctx.resolveRequest(ctx, "react-native-harmony", platform);
        } else if (moduleName.startsWith("react-native/")) {
          return ctx.resolveRequest(ctx, moduleName, "ios");
        } else if (isInternalReactNativeRelativeImport(ctx.originModulePath)) {
          if (moduleName.startsWith(".")) {
            const moduleAbsPath = pathUtils.resolve(pathUtils.dirname(ctx.originModulePath), moduleName);
            const [_, modulePathRelativeToReactNative] = moduleAbsPath.split(`${pathUtils.sep}node_modules${pathUtils.sep}react-native${pathUtils.sep}`);
            try {
              return ctx.resolveRequest(ctx, `react-native-harmony${pathUtils.sep}${modulePathRelativeToReactNative}`, "harmony");
            } catch (err) { }

          }
          return ctx.resolveRequest(ctx, moduleName, "ios");
        }
      }
      return ctx.resolveRequest(ctx, moduleName, platform);
    },
  }
};
