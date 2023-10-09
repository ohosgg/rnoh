import type { TurboModule } from "react-native/Libraries/TurboModule/RCTExport";

import * as TurboModuleRegistry from "react-native/Libraries/TurboModule/TurboModuleRegistry";

/* 'buttonClicked' | 'dismissed' */
type AlertAction = string;
/*
  primaryButton = 1,
  secondaryButton = 2,
*/
type AlertButtonKey = number;
export type AlertOptions = {
  title?: string;
  message?: string;
  primaryButton?: string;
  secondaryButton?: string;
  items?: Array<string>;
  cancelable?: boolean;
};

export interface Spec extends TurboModule {
  getConstants: () => {
    buttonClicked: AlertAction;
    dismissed: AlertAction;
    primaryButton: AlertButtonKey;
    secondaryButton: AlertButtonKey;
  };
  alert: (
    options: AlertOptions,
    onError: (error: string) => void,
    onAction: (action: AlertAction, buttonKey?: AlertButtonKey) => void
  ) => void;
}

export default TurboModuleRegistry.get<Spec>("AlertManager");
