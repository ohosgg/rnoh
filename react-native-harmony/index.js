module.exports = {
  get AppRegistry() {
    return require('react-native/Libraries/ReactNative/AppRegistry');
  },
  get Image() {
    return require('react-native/Libraries/Image/Image');
  },
  get NativeModules() {
    return require('react-native/Libraries/BatchedBridge/NativeModules');
  },
  get StyleSheet() {
    return require('react-native/Libraries/StyleSheet/StyleSheet');
  },
  get Text() {
    return require('react-native/Libraries/Text/Text');
  },
  get TextInput() {
    return require('react-native/Libraries/Components/TextInput/TextInput');
  },
  get TurboModuleRegistry() {
    return require('react-native/Libraries/TurboModule/TurboModuleRegistry');
  },
  get UIManager() {
    return require('react-native/Libraries/ReactNative/UIManager');
  },
  get View() {
    return require('react-native/Libraries/Components/View/View');
  },
};