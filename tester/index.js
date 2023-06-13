// @ts-check
/**
 * @format
 */

import {AppRegistry, View, Text} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {InitialParamsContext} from './contexts';

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

AppRegistry.registerComponent(appName, () => App);
