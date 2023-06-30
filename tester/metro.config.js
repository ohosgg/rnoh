const {mergeConfig, getDefaultConfig} = require('@react-native/metro-config');
const harmonyMetroConfig = require('react-native-harmony/metro.config');

/**
 * @type {import("metro-config").ConfigT}
 */
const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), harmonyMetroConfig, config);
