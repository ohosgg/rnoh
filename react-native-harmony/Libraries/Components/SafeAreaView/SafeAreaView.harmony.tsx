import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry, View, ViewProps } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import React from 'react';

import RCTDeviceEventEmitter from 'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter.js';

type SafeAreaInsets = {
  top: number;
  left: number;
  right: number;
  bottom: number;
};

interface SafeAreaTurboModuleProtocol {
  getInsets(): Promise<SafeAreaInsets>;
}

interface Spec extends TurboModule, SafeAreaTurboModuleProtocol {}

const safeAreaTurboModule = TurboModuleRegistry.get<Spec>(
  'SafeAreaTurboModule'
)!;

export default React.forwardRef<View, ViewProps>(
  ({ children, ...otherProps }, ref) => {
    const isMountedRef = useRef(true);
    const [insets, setInsets] = useState<SafeAreaInsets>({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    });

    useEffect(
      function subscribeToInsetsChanges() {
        isMountedRef.current = true;
        safeAreaTurboModule.getInsets().then((insets) => {
          if (isMountedRef.current) {
            setInsets(insets);
          }
        });
        const subscription = (RCTDeviceEventEmitter as any).addListener(
          'SAFE_AREA_INSETS_CHANGE',
          (insets: SafeAreaInsets) => {
            if (isMountedRef.current) {
              setInsets(insets);
            }
          }
        );
        return () => {
          isMountedRef.current = false;
          subscription.remove();
        };
      },
      [isMountedRef]
    );

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
