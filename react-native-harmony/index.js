module.exports = {
 
  get Animated() {
    return require('react-native/Libraries/Animated/Animated').default;
  },
  get AppRegistry() {
    return require('react-native/Libraries/ReactNative/AppRegistry');
  },
  get AppState() {
    return require('react-native/Libraries/AppState/AppState');
  },
  get BackHandler() {
    return require('./Libraries/Utilities/BackHandler');
  },
  get Button() {
    return require('react-native/Libraries/Components/Button');
  },
  get Dimensions() {
    return require('react-native/Libraries/Utilities/Dimensions');
  },
  get Easing() {
    return require('react-native/Libraries/Animated/Easing').default;
  },
  get FlatList() {
    return require('react-native/Libraries/Lists/FlatList');
  },
  get Image() {
    return require('react-native/Libraries/Image/Image');
  },
  get I18nManager() {
    return require('react-native/Libraries/ReactNative/I18nManager');
  },
  get LayoutAnimation() {
    return require('react-native/Libraries/LayoutAnimation/LayoutAnimation');
  },
  get Linking() {
    return require('./Libraries/Linking/Linking');
  },
  get Modal() {
    return require('react-native/Libraries/Modal/Modal');
  },
  get Keyboard() {
    return require('react-native/Libraries/Components/Keyboard/Keyboard');
  },
  get NativeEventEmitter() {
    return require('react-native/Libraries/EventEmitter/NativeEventEmitter')
      .default;
  },
  get NativeModules() {
    return require('react-native/Libraries/BatchedBridge/NativeModules');
  },
  get PixelRatio() {
    return require('react-native/Libraries/Utilities/PixelRatio').default;
  },
  get Platform() {
    return require('./Libraries/Utilities/Platform');
  },
  get Pressable() {
    return require('react-native/Libraries/Components/Pressable/Pressable')
      .default;
  },
  get RefreshControl() {
    return require('react-native/Libraries/Components/RefreshControl/RefreshControl');
  },
  get ScrollView() {
    return require('react-native/Libraries/Components/ScrollView/ScrollView');
  },
  get StatusBar() {
    return require('./Libraries/Components/StatusBar/StatusBar.harmony');
  },
  get StyleSheet() {
    return require('react-native/Libraries/StyleSheet/StyleSheet');
  },
  get Switch() {
    return require('react-native/Libraries/Components/Switch/Switch').default;
  },
  get Text() {
    return require('react-native/Libraries/Text/Text');
  },
  get TextInput() {
    return require('./Libraries/Components/TextInput/TextInput.harmony');
  },
  get Touchable() {
    return require('react-native/Libraries/Components/Touchable/Touchable');
  },
  get TouchableHighlight() {
    return require('react-native/Libraries/Components/Touchable/TouchableHighlight');
  },
  get TouchableNativeFeedback() {
    return require('react-native/Libraries/Components/Touchable/TouchableNativeFeedback');
  },
  get TouchableOpacity() {
    return require('react-native/Libraries/Components/Touchable/TouchableOpacity');
  },
  get TouchableWithoutFeedback() {
    return require('react-native/Libraries/Components/Touchable/TouchableWithoutFeedback');
  },
  get TurboModuleRegistry() {
    return require('react-native/Libraries/TurboModule/TurboModuleRegistry');
  },
  get UIManager() {
    return require('react-native/Libraries/ReactNative/UIManager');
  },
  get useAnimatedValue() {
    return require('react-native/Libraries/Animated/useAnimatedValue').default;
  },
  get useWindowDimensions() {
    return require('react-native/Libraries/Utilities/useWindowDimensions')
      .default;
  },
  get View() {
    return require('react-native/Libraries/Components/View/View');
  },
  get InteractionManager() {
    return require('react-native/Libraries/Interaction/InteractionManager');
  },
  get PanResponder() {
    return require('react-native/Libraries/Interaction/PanResponder').default;
  },
  get processColor() {
    return require('react-native/Libraries/StyleSheet/processColor').default;
  },
  get SectionList() {
    return require('react-native/Libraries/Lists/SectionList').default;
  },
  get VirtualizedList() {
    return require('react-native/Libraries/Lists/VirtualizedList');
  },
  // BEGIN: react-native-harmony specific exports
  get registerViewConfig() {
    return require('react-native/Libraries/Renderer/shims/ReactNativeViewConfigRegistry')
      .register;
  },
  get ReactNativeViewAttributes() {
    return require('react-native/Libraries/Components/View/ReactNativeViewAttributes');
  },
  get dispatchCommand() {
    return require('react-native/Libraries/Renderer/shims/ReactNative')
      .dispatchCommand;
  },
  // END: react-native-harmony specific exports
};
