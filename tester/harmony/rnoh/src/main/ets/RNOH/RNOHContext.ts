import type common from '@ohos.app.ability.common';
import type { DescriptorRegistry } from './DescriptorRegistry';
import type { CommandDispatcher } from './CommandDispatcher';
import type { RNOHLogger } from './RNOHLogger';
import type { RNInstance } from './RNInstance';
import type { ComponentManagerRegistry } from './ComponentManagerRegistry';
import { RNScrollLocker } from './RNScrollLocker';

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

  public get scrollLocker(): RNScrollLocker {
    return this.rnInstance.scrollLocker;
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
