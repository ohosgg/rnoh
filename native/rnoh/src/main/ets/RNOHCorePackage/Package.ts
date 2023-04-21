import { RNPackage, TurboModulesFactory } from "../RNPackage";
import type { TurboModule, TurboModuleContext } from '../TurboModule';
import { PlatformConstantsTurboModule, DeviceInfoTurboModule, SourceCodeTurboModule, SampleTurboModule, TimingTurboModule } from "./TurboModules";


export class RNOHCorePackage extends RNPackage {
  createTurboModulesFactory(ctx: TurboModuleContext): TurboModulesFactory {
    return new CoreTurboModulesFactory(ctx);
  }
}

const TURBO_MODULE_CLASS_BY_NAME: Record<string, typeof TurboModule> = {
  "SampleTurboModule": SampleTurboModule,
  "PlatformConstants": PlatformConstantsTurboModule,
  "DeviceInfo": DeviceInfoTurboModule,
  "SourceCode": SourceCodeTurboModule,
  "Timing": TimingTurboModule,
};

class CoreTurboModulesFactory extends TurboModulesFactory {
  createTurboModule(name: string): TurboModule {
    if (this.hasTurboModule(name)) {
      return new TURBO_MODULE_CLASS_BY_NAME[name](this.ctx);
    }
    return null;
  }

  hasTurboModule(name: string): boolean {
    return name in TURBO_MODULE_CLASS_BY_NAME;
  }
}
