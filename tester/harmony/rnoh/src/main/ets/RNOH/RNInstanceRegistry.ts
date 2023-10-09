import common from '@ohos.app.ability.common';
import { RNInstance, RNInstanceImpl } from './RNInstance';
import { NapiBridge } from './NapiBridge';
import { RNOHContext } from './RNOHContext';
import { RNOHLogger } from './RNOHLogger';
import { RNPackage, RNPackageContext } from './RNPackage';


export class RNInstanceRegistry {
  private nextInstanceId = 0;
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
    const id = this.nextInstanceId++;
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