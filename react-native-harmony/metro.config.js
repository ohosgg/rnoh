/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const pathUtils = require('path');

function shouldReplaceRN(moduleName) {
  return moduleName === "react-native";
}

function shouldUseIOSPlatform(moduleName, originModulePath) {
  return moduleName.startsWith("react-native/") || originModulePath.includes(`${pathUtils.sep}node_modules${pathUtils.sep}react-native${pathUtils.sep}`);
}


/**
 * @type {import("@types/metro-config").ConfigT}
 */
module.exports = {
  transformer: {
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
        if (shouldReplaceRN(moduleName)) {
          return ctx.resolveRequest(ctx, "react-native-harmony", platform);
        } else if (shouldUseIOSPlatform(moduleName, ctx.originModulePath)) {
          return ctx.resolveRequest(ctx, moduleName, "ios");
        }
      }
      return ctx.resolveRequest(ctx, moduleName, platform);
    }
  }
};
