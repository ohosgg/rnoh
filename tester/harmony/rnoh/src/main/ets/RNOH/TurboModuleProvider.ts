import type { TurboModule } from './TurboModule';
import type { TurboModulesFactory } from './RNPackage';

export class TurboModuleProvider {
  private cachedTurboModuleByName: Record<string, TurboModule> = {};

  constructor(private turboModulesFactories: TurboModulesFactory[]) { }

  getModule<T extends TurboModule>(name: string): T {
    if (!(name in this.cachedTurboModuleByName)) {
      for (const tmFactory of this.turboModulesFactories) {
        if (tmFactory.hasTurboModule(name)) {
          this.cachedTurboModuleByName[name] = tmFactory.createTurboModule(name);
          if (this.cachedTurboModuleByName[name] === null) {
            throw new Error(`Couldn't create "${name}" Turbo Module`);
          }
        }
      }
    }
    return this.cachedTurboModuleByName[name] as T;
  }

  hasModule(name: string) {
    for (const tmFactory of this.turboModulesFactories) {
      if (tmFactory.hasTurboModule(name)) {
        return true;
      }
    }
    return false;
  }
}
