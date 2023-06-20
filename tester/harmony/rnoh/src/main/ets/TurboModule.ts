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

export abstract class EventEmittingTurboModule<TSupportedEventName extends string> extends TurboModule {
  listenerCount: number = 0

  constructor(protected ctx: TurboModuleContext) {
    super(ctx);
  };

  protected abstract getSupportedEvents(): readonly TSupportedEventName[];

  addListener(eventName: TSupportedEventName) {
    if (this.getSupportedEvents().indexOf(eventName) === -1) {
      throw new Error(`Trying to subscribe to unknown event: "${eventName}"`);
    }

    this.listenerCount++;
  }

  removeListeners(count: number) {
    this.listenerCount -= count;
  }

  protected sendEvent(eventName: TSupportedEventName, params: any) {
    this.ctx.rnInstanceManager.emitDeviceEvent(eventName, params)
  }
}
