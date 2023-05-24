const { config: harmonyConfig } = require('./dist');

/**
 * @type {import("@react-native-community/cli-types").Config}
 */
const config = {
  commands: harmonyConfig.commands,
};

module.exports = config;
