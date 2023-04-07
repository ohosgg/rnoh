import type { TurboModule } from './TurboModule';
import { SampleTurboModule } from "./SampleTurboModule";

const TURBO_MODULE_FACTORY_BY_NAME: Record<string, () => TurboModule> = {
  "SampleTurboModule": () => new SampleTurboModule()
};

export class TurboModuleFactory {
  createTurboModule(name: string): TurboModule {
    if (this.hasModule(name)) {
      return TURBO_MODULE_FACTORY_BY_NAME[name]();
    }
    throw new Error('Turbo Module not found');
  }

  hasModule(name: string): boolean {
    return name in TURBO_MODULE_FACTORY_BY_NAME;
  }
}

