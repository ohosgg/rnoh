import { DescriptorWrapperFactoryByDescriptorType, RNPackage, TurboModulesFactory } from '../RNOH/RNPackage';
import type { TurboModule, TurboModuleContext } from '../RNOH/TurboModule';
import {
  AlertManagerTurboModule,
  AppearanceTurboModule,
  AppStateTurboModule,
  DeviceEventManagerTurboModule,
  DeviceInfoTurboModule,
  DevMenuTurboModule,
  DevSettingsTurboModule,
  ExceptionsManagerTurboModule,
  I18nManagerTurboModule,
  ImageLoaderTurboModule,
  KeyboardObserverTurboModule,
  NativeAnimatedTurboModule,
  NetworkingTurboModule,
  PlatformConstantsTurboModule,
  SafeAreaTurboModule,
  SourceCodeTurboModule,
  StatusBarTurboModule,
  TimingTurboModule,
  WebSocketTurboModule
} from './turboModules';
import { LinkingManagerTurboModule } from './turboModules/LinkingManagerTurboModule';
import { ViewDescriptorWrapper } from './components/ts';

export class RNOHCorePackage extends RNPackage {
  createTurboModulesFactory(ctx: TurboModuleContext): TurboModulesFactory {
    return new CoreTurboModulesFactory(ctx);
  }

  createDescriptorWrapperFactoryByDescriptorType({}): DescriptorWrapperFactoryByDescriptorType {
    return { "View": (ctx) => new ViewDescriptorWrapper(ctx.descriptor) }
  }

  getDebugName() {
    return "rnoh"
  }
}

const TURBO_MODULE_CLASS_BY_NAME: Record<string, typeof TurboModule> = {
  [AlertManagerTurboModule.NAME]: AlertManagerTurboModule,
  [AppearanceTurboModule.NAME]: AppearanceTurboModule,
  [AppStateTurboModule.NAME]: AppStateTurboModule,
  [DeviceEventManagerTurboModule.NAME]: DeviceEventManagerTurboModule,
  [DevSettingsTurboModule.NAME]: DevSettingsTurboModule,
  [DevMenuTurboModule.NAME]: DevMenuTurboModule,
  [ExceptionsManagerTurboModule.NAME]: ExceptionsManagerTurboModule,
  [ImageLoaderTurboModule.NAME]: ImageLoaderTurboModule,
  [KeyboardObserverTurboModule.NAME]: KeyboardObserverTurboModule,
  [NativeAnimatedTurboModule.NAME]: NativeAnimatedTurboModule,
  [LinkingManagerTurboModule.NAME]: LinkingManagerTurboModule,
  [NetworkingTurboModule.NAME]: NetworkingTurboModule,
  [PlatformConstantsTurboModule.NAME]: PlatformConstantsTurboModule,
  [SourceCodeTurboModule.NAME]: SourceCodeTurboModule,
  [TimingTurboModule.NAME]: TimingTurboModule,
  [WebSocketTurboModule.NAME]: WebSocketTurboModule,
  [I18nManagerTurboModule.NAME]: I18nManagerTurboModule,
};

const EAGER_TURBO_MODULE_CLASS_BY_NAME = {
  [DeviceInfoTurboModule.NAME]: DeviceInfoTurboModule,
  [StatusBarTurboModule.NAME]: StatusBarTurboModule,
  [SafeAreaTurboModule.NAME]: SafeAreaTurboModule,
} as const

class CoreTurboModulesFactory extends TurboModulesFactory {
  private eagerTurboModuleByName: Partial<Record<keyof typeof EAGER_TURBO_MODULE_CLASS_BY_NAME, TurboModule>> = {}

  async prepareEagerTurboModules() {
    const statusBarTurboModule = new StatusBarTurboModule(this.ctx)
    this.eagerTurboModuleByName = {
      [SafeAreaTurboModule.NAME]: await SafeAreaTurboModule.create(this.ctx, statusBarTurboModule),
      [StatusBarTurboModule.NAME]: statusBarTurboModule,
      [DeviceInfoTurboModule.NAME]: await DeviceInfoTurboModule.create(this.ctx),
    }
  }

  createTurboModule(name: string): TurboModule {
    if (this.eagerTurboModuleByName[name]) {
      return this.eagerTurboModuleByName[name]
    }
    if (this.hasTurboModule(name)) {
      return new TURBO_MODULE_CLASS_BY_NAME[name](this.ctx);
    }
    return null;
  }

  hasTurboModule(name: string): boolean {
    return (name in TURBO_MODULE_CLASS_BY_NAME) || (name in this.eagerTurboModuleByName);
  }
}
