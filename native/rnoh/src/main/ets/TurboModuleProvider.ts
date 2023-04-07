import type { TurboModule } from './TurboModule'
import { TurboModuleFactory } from './TurboModuleFactory'

export class TurboModuleProvider {
  constructor(private turboModuleFactory: TurboModuleFactory) {}

  getModule(name: string): TurboModule {
    // TODO: caching
    return this.turboModuleFactory.createTurboModule(name)
  }

  hasModule(name: string) {
      return this.turboModuleFactory.hasModule(name)
  }
}
