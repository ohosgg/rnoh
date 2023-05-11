module.exports = {
  get AppRegistry() {
    return require('react-native/Libraries/ReactNative/AppRegistry');
  },
  get FlatList() {
    return require('react-native/Libraries/Lists/FlatList');
  },
  get Image() {
    return require('react-native/Libraries/Image/Image');
  },
  get NativeModules() {
    return require('react-native/Libraries/BatchedBridge/NativeModules');
  },
  get Platform() {
    return require('./Libraries/Utilities/Platform');
  },
  get PixelRatio() {
    return require('react-native/Libraries/Utilities/PixelRatio');
  },
  get ScrollView() {
    return require('react-native/Libraries/Components/ScrollView/ScrollView');
  },
  get StyleSheet() {
    return require('react-native/Libraries/StyleSheet/StyleSheet');
  },
  get Text() {
    return require('react-native/Libraries/Text/Text');
  },
  get TextInput() {
    return require('./Libraries/Components/TextInput/TextInput.harmony');
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
  get PanResponder() {
    return require('react-native/Libraries/Interaction/PanResponder');
  },
};