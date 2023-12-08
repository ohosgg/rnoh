# Changelog

## v0.72.12
- added `ScrollView::inverted` prop support
- added more detailed logs
- added `ScrollView::maintainVisibleContentPosition` support
- added `TextInput::clearOnFocus` support
- added `hints` support:
  - `debug` hint
  - `ready` hint
- added `RNInstance::blockComponentsGestures` method
- added error handling for errors thrown from turbo modules
- fixed unnecessary text wrapping issue
- fixed touches when transform was provided
- fixed image sometimes not changing on source change
- fixed imports not being hijacked to scoped third-party harmony packages
- fixed `fontColor` in `TextInput`
- fixed opacity exceeding the range
- fixed some props sometimes not being provided to native components
- fixed RefreshControl behavior
- fixed inserting ellipsis when `Text` has padding
- fixed opacity not being animated when using layout animations
- fixed reacting on dimensions change on devices with folding screen
- fixed aggressive page snapping

## v0.72.11
- BREAKING: `react-native-harmony/metro.config` exports now a function that creates configuration instead of configuration
- added `TextInput::keyboardType` support
- added a way to replace implementation of any RN component
- added custom fonts support
- added animated gif support in `Image` component
- added http redirects support in `Image` component
- added `arrayBuffer` response type support in `fetch`
- added `Animated.{diffClamp, tracking, modulus}` support when native driver is enabled
- added `I18nManager::isRTL` support
- added data URIs in `Image`
- added basic `RefreshControl::progressViewOffset` support
- added `console.log` support
- added Image::alt support
- added padding support in `TextInput`
- added `ScrollView::snapToStart/End` support
- added `TextInput::onBlur` support
- added sms schema support in `Linking` module
- added `TextInput::onKeyPress` support
- added `requireNativeComponent` support
- added `RootTagContext` support
- added `ScrollView::pagingEnabled` support
- added `ScrollView::snapToAlignment` support
- added `ScrollView::flashScrollIndicators` support
- added `ScrollView::disableIntervalMomentum` support
- fixed text being slightly bigger than views containing that text
- fixed infinite `TextInput::value` updates
- fixed crashes when view inside text was trimmed by `numberOfLines`
- fixed deadlock when using multiple surfaces
- fixed touch issues caused by not unregistering component managers properly
- fixed `textDecorationLine` color
- fixed `ScrollView` position when content size changes
- fixed freeze caused by having multiple empty lines in `Text` component
- fixed font style not being applied to `TextInput::placeholder`
- fixed jittering sticky headers
- fixed precision of layout positions and dimensions
- fixed jumping animations, when a render happens during native animation
- fixed vertical alignment of text and attachments inside `Text`
- fixed displaying multiple attachments on top of each other in `Text`
- fixed padding in `Text` component
- fixed WebSocket error handling
- fixed `VirtualizedList::initialIndex`
- fixed `TextInput` autofocus outside of modal
- fixed `PlatformConstants::reactNativeVersion` format

## v0.72.10
- breaking change: SurfaceHandle::start is now async
- added basic support for KeyboardAvoidingView
- added Model to Platform.constants
- added Image::onLoad support
- added basic TextInput::autoFocus support
- fixed loading remote images when urls is redirected
- fixed presses for views with translations animated with native driver
- fixed text wrapping after characters
- fixed onBlur crashing the app
- fixed empty values in TextInputs
- fixed maxLength in TextInput
- fixed nested scroll views
- fixed RNViewManager::parentTag incorrectly returning undefined
- fixed Text's onLayout
- fixed deadlock caused by creating/updating/destroying surfaces
- fixed unnecessary text wrapping
- fixed locking scroll from component manager

## v0.72.9
- breaking change: SurfaceHandle::stop and SurfaceHandle::destroy are now async
- added hitSlop support
- added basic onBlur support
- added support for TextInput content passed in onFocus event
- added basic useColorScheme support
- added Animated.decay support
- added Animated.spring support
- added ScrollView::scrollToEnd support
- fixed incorrect lineHeight calculation
- fixed onPress not firing when view and pressable were flattened
- fixed onPress working unreliably
- fixed TextInput autofocus
- fixed TextInput::value
- fixed wrapping of Chinese characters
- fixed single view in Text crashing the app
- fixed not working props for multiline TextInput
- fixed Animated.Value callback timing issue
- fixed deadlock caused when creating/destroying surfaces

## v0.72.8
- added layout animations support
- added ellipsis support when text components are nested or text component inside another text component
- fixed timer behavior when an app is in background
- fixed text input styling issues
- fixed `fetch`
- fixed errors reported by new ArkTS linter
- fixed app crashes caused sometimes caused by touches

## v0.72.7
- added ScrollView::persistentScrollbar
- added ActivityIndicator support
- added Text props/styles support:
  - vertical alignement
  - letter spacing 
  - selectable
  - ellipsizeMode
  - disabled
  - textShadow
- added View::borderStyle
- added ScrollView::contentOffset prop support
- added edge specific border width support
- added overflow support
- added ScrollView::scrollEnabled support
- added ScrollView::indicatorStyle support
- added ScrollView::decelerationRate support
- added basic linking API support
- added an option to blur images
- added nested text support
- added views inside text support
- added hermes bytecode bundles support
- added basic Keyboard module support
- added SafeAreaView support
- support TextInput props:
  - editable
  - caretHidden
  - maxLength
  - selectionColor
  - secureTextEntry
  - placeholder
  - placeholderTextColor
- fixed custom RefreshControl components
- fixed timers not being paused when the app is in background
- fixed awaiting JS Bundle execution
- updated React Native to 0.72.5
- changed approach to handling touches
  
## v0.72.6
- added support for Switch:disabled
- added support for Animated.Value listeners
- added Image.getSize support
- added Image::resizeMode prop support
- added RefreshControl component support
- added Text::textDecoration and Text::textDecorationColor support
- added iOS View shadow props support
- added support for multiple RN Instances and surfaces
- added border edge specific colors
- added interface JSBundleProvider
- added Image::tintColor support
- added ComponentManagers
- added Image::prefetch support
- added Text::padding support
- added View::borderStyle support
- fixed DrawerLayoutAndroid causing compilation errors
- fixed flickering modal contents
- fixed bundle-harmony arguments
- changed assets directory
- fixed deadlock caused by timing and animated turbo modules

## v0.72.5
- added support for Switch component
- reexported DeviceEventEmitter and findNodeHandle
- improved logging fatal errors
- fixed ScrollView offset when a ScrollView had a border
- fixed tap not stopping scrolling

## v0.72.4
- BREAKING CHANGE: replaced `EventEmitterRegistry.cpp` with `ShadowViewRegistry.cpp`
- added `Modal` component support
- added an option to set CPP state from eTS
- added Addition, Subtraction, Multiplication, and Division Animation Nodes
- fixed transforms
- reexported `dispatchCommand` method for custom fabric components that don't use code generation utility

## v0.72.3
- fixed TextInput not working correctly since v0.72.0
- fixed crashing on Open Harmony 4.0.8.5

## v0.72.2
- BREAKING CHANGE: renamed harmony module from `@ohos/rnoh` to `rnoh`
- BREAKING CHANGE: changed the interface of `EventEmitRequestHandler` and `Package::createEventEmitRequestHandlers`
- added support for `pointerEvents`
- added support for scroll driven animations to  native driver
- added support for horizontal scrolling
- added support for `BackHandler.exitApp()`
- various memory management tweaks that probably fix some memory leaks
- bumped react-native-harmony-cli to fix crash caused by `node_modules/.bin` when unpacking harmony modules

## v0.72.1
- fixed react-native unpack-harmony not replacing the native module when updating npm package
- fixed crash when removing a scrolling ScrollView
- fixed color transformation for custom components when a NapiBinder was not provided
- fixed an error thrown by React Native renderer caused by dispatching wrong touch events 
- fixed `collapsable` property
- fixed `onLayout` property
- fixed `FlatList` displaying wrong items
- added development mode (which can be disabled by using `prod` flag: `react-native bundle-harmony --prod`)
- added caching text measurements
- added a basic support for a native driver
- added back button handler - requires adapting `entry/pages/Index.ets` code, since listener for back button callbacks can only be added to the entry component
- removed rnInstance property from RNOHContext in favor of rnInstanceManager
- 
## v0.72.0
- upgraded React Native from 0.71.3 to 0.72.0
- added support for transform properties
- added support for momentum scroll events
- improved setTimeout by respecting native call delay
- fixed layout issues after hiding status bar

## v0.0.20
- added RNBaseView in order to share common styles and handlers with custom components
- added ability to provide custom logger
- added text width measurer (height must be provided)
- added support for nesting Text components
- added support for specifying border radius per corner
- added support for text alignement
- added ability to overwrite bundle loading code
- added basic support for StatusBar
- improved rendering performance
- styles support should be similar across various components
- fixed drawing order
- fixed touches in ScrollView

## v0.0.19
- breaking change: changed interface on the native side
  - made the `RNAbility` more robust
- improved lifecycle management
- fixed background/border colors updates
- added an option to send initialProps from native side to RN app

## v0.0.18
- breaking change: removed `@Provide`/`@Consume` from RNOH components to improve performance
- fixed source of fatal crashes
- fixed default colors
- added a event communication channel for third party libraries
- added support for AppState
