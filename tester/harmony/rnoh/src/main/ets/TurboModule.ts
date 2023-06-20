import type { RNInstance, NapiBridge } from './RNInstance'
import type { RNInstanceManager } from "./RNAbility"
import common from '@ohos.app.ability.common'

export interface TurboModuleContext {
  reactNativeVersion: string;
  /// @deprecated - Use `rnInstanceManager`
  rnInstance: RNInstance;
  __napiBridge: NapiBridge
  uiAbilityContext: common.UIAbilityContext;
  rnInstanceManager: RNInstanceManager
}

export class TurboModule {
  constructor(protected ctx: TurboModuleContext) {
  };
}
