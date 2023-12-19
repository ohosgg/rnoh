import type common from '@ohos.app.ability.common';
import type { RNInstance} from './RNInstance';
import { RNInstanceImpl } from './RNInstance';
import type { NapiBridge } from './NapiBridge';
import type { RNOHContext } from './RNOHContext';
import type { RNOHLogger } from './RNOHLogger';
import type { RNPackage, RNPackageContext } from './RNPackage';


export class RNInstanceRegistry {
  private instanceMap: Map<number, RNInstanceImpl> = new Map();

  constructor(
    private logger: RNOHLogger,
    private napiBridge: NapiBridge,
    private abilityContext: common.UIAbilityContext,
    private createRNOHContext: (rnInstance: RNInstance) => RNOHContext
  ) {
  }

  public async createInstance(
    options: {
      createRNPackages: (ctx: RNPackageContext) => RNPackage[]
    }
  ): Promise<RNInstance> {
    const id = this.napiBridge.getNextRNInstanceId();
    const instance = new RNInstanceImpl(
      id,
      this.logger,
      this.abilityContext,
      this.napiBridge,
      this.getDefaultProps(),
      this.createRNOHContext
    )
    await instance.initialize(options.createRNPackages({}))
    this.instanceMap.set(id, instance)
    return instance;
  }

  public getInstance(id: number): RNInstance {
    return this.instanceMap.get(id);
  }

  public deleteInstance(id: number): boolean {
    if (this.instanceMap.has(id)) {
      this.instanceMap.delete(id);
      return true;
    }
    return false;
  }

  public forEach(cb: (rnInstance: RNInstanceImpl) => void) {
    this.instanceMap.forEach(cb)
  }

  private getDefaultProps(): Record<string, any> {
    return { concurrentRoot: true }
  }
}