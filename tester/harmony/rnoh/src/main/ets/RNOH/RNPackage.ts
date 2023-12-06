import type { TurboModule, TurboModuleContext } from "./TurboModule";

export abstract class TurboModulesFactory {
  constructor(protected ctx: TurboModuleContext) {
  }

  abstract createTurboModule(name: string): TurboModule | null;

  prepareEagerTurboModules(): Promise<void> {
    return Promise.resolve()
  }

  abstract hasTurboModule(name: string): boolean;
}

export type RNPackageContext = {};

export abstract class RNPackage {
  constructor(protected ctx: RNPackageContext) {
  };

  abstract createTurboModulesFactory(ctx: TurboModuleContext): TurboModulesFactory;

  getDebugName(): string | undefined {
    return undefined
  }
}