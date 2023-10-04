import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry, View, ViewProps } from 'react-native';
import { useEffect, useState } from 'react';
import React from 'react';

import RCTDeviceEventEmitter from 'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter.js';

type SafeAreaInsets = {
  top: number;
  left: number;
  right: number;
  bottom: number;
};

interface SafeAreaTurboModuleProtocol {
  getInitialInsets(): SafeAreaInsets;
}

interface Spec extends TurboModule, SafeAreaTurboModuleProtocol {}

const safeAreaTurboModule = TurboModuleRegistry.get<Spec>(
  'SafeAreaTurboModule'
)!;

export default React.forwardRef<View, ViewProps>(
  ({ children, ...otherProps }, ref) => {
    const [insets, setInsets] = useState<SafeAreaInsets>(
      safeAreaTurboModule.getInitialInsets()
    );

    useEffect(function subscribeToInsetsChanges() {
      const subscription = (RCTDeviceEventEmitter as any).addListener(
        'SAFE_AREA_INSETS_CHANGE',
        (insets: SafeAreaInsets) => {
          setInsets(insets);
        }
      );
      return () => {
        subscription.remove();
      };
    }, []);

    return (
      <View ref={ref} {...otherProps}>
        <View
          style={{
            width: '100%',
            height: '100%',
            paddingTop: insets.top,
            paddingLeft: insets.left,
            paddingRight: insets.right,
            paddingBottom: insets.bottom,
          }}
        >
          {children}
        </View>
      </View>
    );
  }
);
