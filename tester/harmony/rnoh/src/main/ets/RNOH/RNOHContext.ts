import type common from '@ohos.app.ability.common';
import type { DescriptorRegistry } from './DescriptorRegistry';
import type { RNComponentCommandHub, RNComponentCommandReceiver } from './RNComponentCommandHub';
import type { RNOHLogger } from './RNOHLogger';
import type { RNInstance, RNInstanceImpl } from './RNInstance';
import type { ComponentManagerRegistry } from './ComponentManagerRegistry';
import { RNScrollLocker } from './RNScrollLocker';

export class RNOHContext {
  public get descriptorRegistry(): DescriptorRegistry {
    return this.rnInstance.descriptorRegistry;
  }

  /**
   * @deprecated: Use componentCommandReceiver instead.
   */
  public get commandDispatcher(): RNComponentCommandHub {
    return this.rnInstanceImpl.componentCommandHub;
  }

  public get componentCommandReceiver(): RNComponentCommandReceiver {
    return this.rnInstanceImpl.componentCommandHub;
  }

  public get uiAbilityContext(): common.UIAbilityContext {
    return this.rnInstance.abilityContext;
  }

  public get componentManagerRegistry(): ComponentManagerRegistry {
    return this.rnInstance.componentManagerRegistry;
  }

  public get scrollLocker(): RNScrollLocker {
    return this.rnInstance.scrollLocker;
  }

  /**
   * @deprecated Use `rnInstance` instead.
   */
  public get rnInstanceManager(): RNInstance {
    return this.rnInstance;
  }

  public get rnInstance(): RNInstance {
    return this.rnInstanceImpl
  }

  constructor(
    public reactNativeVersion: string,
    private rnInstanceImpl: RNInstanceImpl,
    public logger: RNOHLogger,
  ) {
  }
}
