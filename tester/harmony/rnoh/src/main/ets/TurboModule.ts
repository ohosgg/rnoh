import type { RNInstance } from './RNInstance'
import common from '@ohos.app.ability.common'

export interface TurboModuleContext {
  reactNativeVersion: string;
  rnInstance: RNInstance;
  uiAbilityContext: common.UIAbilityContext;
}

export class TurboModule {
  constructor(protected ctx: TurboModuleContext) {
  };
}

export abstract class EventEmittingTurboModule extends TurboModule {
  supportedEvents: string[]
  listenerCount: number = 0

  constructor(protected ctx: TurboModuleContext) {
    super(ctx);
  };

  addListener(eventName: string) {
    if (this.supportedEvents.indexOf(eventName) === -1) {
      throw new Error(`Trying to subscribe to unknown event: "${eventName}"`);
    }

    this.listenerCount++;
  }

  removeListeners(count: number) {
    this.listenerCount -= count;
  }

  protected sendEvent(eventName: string, params: any) {
    this.ctx.rnInstance.callRNFunction("RCTDeviceEventEmitter", "emit", [eventName, params]);
  }
}
