import type { TurboModule } from './TurboModule';
import type { TurboModulesFactory } from './RNPackage';
import { RNOHLogger } from './RNOHLogger';

export class TurboModuleProvider {
  private cachedTurboModuleByName: Record<string, TurboModule> = {};
  private logger: RNOHLogger

  constructor(private turboModulesFactories: TurboModulesFactory[], logger: RNOHLogger) {
    this.logger = logger.clone("TurboModuleProvider");
  }

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

  onDestroy() {
    Object.entries(this.cachedTurboModuleByName).forEach(([name, turboModule]) => {
      try {
        turboModule.__onDestroy__()
      } catch {
        this.logger.error("Error while cleaning up TurboModule "+name);
      }
    })
  }
}
