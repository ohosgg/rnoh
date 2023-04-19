import type { TurboModule } from './TurboModule';
import { TurboModuleFactory } from './TurboModuleFactory';

export class TurboModuleProvider {
  private cachedTurboModuleByName: Record<string, TurboModule> = {};

  constructor(private turboModuleFactory: TurboModuleFactory) { }

  getModule<T extends TurboModule>(name: string): T {
    if (!(name in this.cachedTurboModuleByName)) {
      this.cachedTurboModuleByName[name] = this.turboModuleFactory.createTurboModule(name);
    }
    return this.cachedTurboModuleByName[name] as T;
  }

  hasModule(name: string) {
    return this.turboModuleFactory.hasModule(name);
  }
}
