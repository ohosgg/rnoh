import type { TurboModule, TurboModuleContext } from './TurboModule';
import { SampleTurboModule } from "./SampleTurboModule";
import { PlatformConstantsTurboModule, DeviceInfoTurboModule } from "./RNOHCorePackage";

const TURBO_MODULE_FACTORY_BY_NAME: Record<string, typeof TurboModule> = {
  "SampleTurboModule": SampleTurboModule,
  "PlatformConstants": PlatformConstantsTurboModule,
  "DeviceInfo": DeviceInfoTurboModule
};

export class TurboModuleFactory {

  createTurboModule(name: string): TurboModule {
    if (this.hasModule(name)) {
      const ctx: TurboModuleContext = { reactNativeVersion: "0.0.0" };
      return new TURBO_MODULE_FACTORY_BY_NAME[name](ctx);
    }
    throw new Error('Turbo Module not found');
  }

  hasModule(name: string): boolean {
    return name in TURBO_MODULE_FACTORY_BY_NAME;
  }
}

