import { DescriptorRegistry } from './DescriptorRegistry';
import { CommandDispatcher } from './CommandDispatcher';
import { Descriptor } from './DescriptorBase';
import { RNOHLogger } from "./RNOHLogger";
import common from '@ohos.app.ability.common';
import { RNInstance } from '.';

export type RootDescriptor = Descriptor<"RootView", any>

export class RNOHContext {
  // TODO: deprecate these properties, use RNInstance instead
  public get descriptorRegistry(): DescriptorRegistry {
    return this.rnInstanceManager.descriptorRegistry;
  }
  public get commandDispatcher(): CommandDispatcher {
    return this.rnInstanceManager.commandDispatcher;
  }
  public get uiAbilityContext(): common.UIAbilityContext {
    return this.rnInstanceManager.abilityContext
  }

  constructor(public reactNativeVersion: string,
              public rnInstanceManager: RNInstance,
              public logger: RNOHLogger) {}
}
