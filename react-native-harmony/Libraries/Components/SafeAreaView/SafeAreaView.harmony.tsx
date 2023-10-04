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
    const [topInset, setTopInset] = useState(
      safeAreaTurboModule.getInitialInsets().top
    );
    const [leftInset, setLeftInset] = useState(
      safeAreaTurboModule.getInitialInsets().left
    );
    const [rightInset, setRightInset] = useState(
      safeAreaTurboModule.getInitialInsets().right
    );
    const [bottomInset, setBottomInset] = useState(
      safeAreaTurboModule.getInitialInsets().bottom
    );

    useEffect(
      function subscribeToSafeAreaChanges() {
        const subscription = (RCTDeviceEventEmitter as any).addListener(
          'SAFE_AREA_INSETS_CHANGE',
          (insets: SafeAreaInsets) => {
            setTopInset(insets.top);
            setBottomInset(insets.bottom);
            setLeftInset(insets.left);
            setRightInset(insets.right);
          }
        );
        return () => {
          subscription.remove();
        };
      },
      [setTopInset, setLeftInset, setRightInset, setBottomInset]
    );

    return (
      <View ref={ref} {...otherProps}>
        <View
          style={{
            width: '100%',
            height: '100%',
            paddingTop: topInset,
            paddingLeft: leftInset,
            paddingRight: rightInset,
            paddingBottom: bottomInset,
          }}
        >
          {children}
        </View>
      </View>
    );
  }
);
