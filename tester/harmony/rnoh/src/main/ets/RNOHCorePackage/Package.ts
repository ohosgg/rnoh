import {RNPackage, TurboModulesFactory} from '../RNOH/RNPackage';
import type {TurboModule, TurboModuleContext} from '../RNOH/TurboModule';
import {
  AppStateTurboModule,
  DeviceInfoTurboModule,
  ExceptionsManagerTurboModule,
  NativeAnimatedTurboModule,
  NetworkingTurboModule,
  PlatformConstantsTurboModule,
  SourceCodeTurboModule,
  StatusBarTurboModule,
  TimingTurboModule,
  WebSocketTurboModule,
} from './turboModules';

export class RNOHCorePackage extends RNPackage {
  createTurboModulesFactory(ctx: TurboModuleContext): TurboModulesFactory {
    return new CoreTurboModulesFactory(ctx);
  }
}

const TURBO_MODULE_CLASS_BY_NAME: Record<string, typeof TurboModule> = {
  AppState: AppStateTurboModule,
  DeviceInfo: DeviceInfoTurboModule,
  ExceptionsManager: ExceptionsManagerTurboModule,
  NativeAnimatedTurboModule: NativeAnimatedTurboModule,
  Networking: NetworkingTurboModule,
  PlatformConstants: PlatformConstantsTurboModule,
  SourceCode: SourceCodeTurboModule,
  StatusBarManager: StatusBarTurboModule,
  Timing: TimingTurboModule,
  WebSocketModule: WebSocketTurboModule,
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
