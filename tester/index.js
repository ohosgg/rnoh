// @ts-check
/**
 * @format
 */

import {AppRegistry, View, Text} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {InitialParamsContext} from './contexts';
import { AnimationsExample, CheckerboardExample, ChessboardExample, CursorExample, FlatListVsScrollViewExample, ImageGalleryExample, LargeImageScrollExample, StickyHeadersExample, TesterExample, TextScrollExample, TogglingComponentExample } from './examples';
import ReactNativeFeatureFlags from 'react-native/Libraries/ReactNative/ReactNativeFeatureFlags';

AppRegistry.setWrapperComponentProvider(appParams => {
  return ({children, ...otherProps}) => (
    <InitialParamsContext.Provider value={otherProps.initialProps}>
      <View
        style={{width: '100%', height: '100%', backgroundColor: '#EEE'}}
        {...otherProps}>
        <View style={{width: '100%', height: 24, backgroundColor: '#333'}}>
          <Text
            style={{
              width: '100%',
              height: '100%',
              fontSize: 10,
              color: 'white',
            }}>
            {JSON.stringify(appParams)}
          </Text>
        </View>
        {children}
      </View>
    </InitialParamsContext.Provider>
  );
});

ReactNativeFeatureFlags.shouldEmitW3CPointerEvents = () => true;
ReactNativeFeatureFlags.shouldPressibilityUseW3CPointerEventsForHover = () =>
  true;

AppRegistry.registerComponent(appName, () => App);

AppRegistry.registerComponent('tester', () => TesterExample);
AppRegistry.registerComponent('animations', () => AnimationsExample);
AppRegistry.registerComponent('checkerboard', () => CheckerboardExample);
AppRegistry.registerComponent('chessboard', () => ChessboardExample);
AppRegistry.registerComponent('cursor', () => CursorExample);
AppRegistry.registerComponent('image_gallery', () => ImageGalleryExample);
AppRegistry.registerComponent(
  'large_image_scroll',
  () => LargeImageScrollExample,
);
AppRegistry.registerComponent('text_scroll', () => TextScrollExample);
AppRegistry.registerComponent('flat_list', () => FlatListVsScrollViewExample);
AppRegistry.registerComponent('toggling', () => TogglingComponentExample);
AppRegistry.registerComponent('sticky_headers', () => StickyHeadersExample);
