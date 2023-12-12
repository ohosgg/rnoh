import type { TurboModule, TurboModuleContext } from "./TurboModule";
import type { DescriptorWrapperFactory } from "./DescriptorRegistry"

export abstract class TurboModulesFactory {
  constructor(protected ctx: TurboModuleContext) {
  }

  abstract createTurboModule(name: string): TurboModule | null;

  prepareEagerTurboModules(): Promise<void> {
    return Promise.resolve()
  }

  abstract hasTurboModule(name: string): boolean;
}

class FakeTurboModulesFactory extends TurboModulesFactory {
  createTurboModule(name: string) {
    return null
  }

  hasTurboModule(name: string) {
    return false
  }
}

export type RNPackageContext = {};
export type DescriptorWrapperFactoryByDescriptorTypeCtx = {}
export type DescriptorWrapperFactoryByDescriptorType = Record<string, DescriptorWrapperFactory>

export abstract class RNPackage {
  constructor(protected ctx: RNPackageContext) {
  };

  createTurboModulesFactory(ctx: TurboModuleContext): TurboModulesFactory {
    return new FakeTurboModulesFactory(ctx)
  };

  getDebugName(): string | undefined {
    return undefined
  }

  createDescriptorWrapperFactoryByDescriptorType(ctx: DescriptorWrapperFactoryByDescriptorTypeCtx): DescriptorWrapperFactoryByDescriptorType {
    return {}
  }
}