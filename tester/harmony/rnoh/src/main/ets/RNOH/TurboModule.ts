import common from '@ohos.app.ability.common'
import type { RNInstance, NapiBridge } from './NapiBridge'
import type { RNInstanceManager } from "./RNAbility"
import type { RNOHLogger } from "./RNOHLogger"

export interface TurboModuleContext {
  reactNativeVersion: string;
  /// @deprecated - Use `rnInstanceManager`
  rnInstance: RNInstance;
  __napiBridge: NapiBridge
  uiAbilityContext: common.UIAbilityContext;
  rnInstanceManager: RNInstanceManager
  logger: RNOHLogger
}

export class TurboModule {
  constructor(protected ctx: TurboModuleContext) {
  };
}
