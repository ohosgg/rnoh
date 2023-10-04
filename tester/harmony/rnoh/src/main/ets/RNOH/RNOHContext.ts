import common from '@ohos.app.ability.common';
import window from '@ohos.window'
import { DescriptorRegistry } from './DescriptorRegistry';
import { CommandDispatcher } from './CommandDispatcher';
import { RNOHLogger } from "./RNOHLogger";
import { RNInstance } from './RNInstance';
import { ComponentManagerRegistry } from './ComponentManagerRegistry';

export class RNOHContext {
  public get descriptorRegistry(): DescriptorRegistry {
    return this.rnInstance.descriptorRegistry;
  }
  public get commandDispatcher(): CommandDispatcher {
    return this.rnInstance.commandDispatcher;
  }
  public get uiAbilityContext(): common.UIAbilityContext {
    return this.rnInstance.abilityContext
  }
  public get componentManagerRegistry(): ComponentManagerRegistry {
    return this.rnInstance.componentManagerRegistry
  }

  /**
   * @deprecated Use `rnInstance` instead.
   */
  public get rnInstanceManager(): RNInstance {
    return this.rnInstance
  }

  constructor(public reactNativeVersion: string,
              public rnInstance: RNInstance,
              public logger: RNOHLogger
  ) {}
}
