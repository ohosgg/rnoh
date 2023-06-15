/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

import type { TurboModule } from "react-native/Libraries/TurboModule/RCTExport";

import * as TurboModuleRegistry from "react-native/Libraries/TurboModule/TurboModuleRegistry";

export interface Spec extends TurboModule {
  +getConstants: () => {|
    +HEIGHT: number,
    +DEFAULT_BACKGROUND_COLOR: number,
  |};
  +setColor: (color: string) => void;
  +setTranslucent: (translucent: boolean) => void;

  /**
   *  - statusBarStyles can be:
   *    - 'default'
   *    - 'dark-content'
   */
  +setStyle: (statusBarStyle?: ?string) => void;
  +setHidden: (hidden: boolean) => void;
}

const NativeModule = TurboModuleRegistry.getEnforcing<Spec>("StatusBarManager");
let constants = null;

const NativeStatusBarManager = {
  getConstants(): {|
    +DEFAULT_BACKGROUND_COLOR?: number,
  |} {
    if (constants == null) {
      constants = NativeModule.getConstants();
    }
    return constants;
  },

  setColor(color: number): void {
    NativeModule.setColor(color);
  },

  setTranslucent(translucent: boolean): void {
    NativeModule.setTranslucent(translucent);
  },

  /**
   *  - statusBarStyles can be:
   *    - 'default'
   *    - 'dark-content'
   */
  setStyle(statusBarStyle?: ?string): void {
    NativeModule.setStyle(statusBarStyle);
  },

  setHidden(hidden: boolean): void {
    NativeModule.setHidden(hidden);
  },
};

export default NativeStatusBarManager;
