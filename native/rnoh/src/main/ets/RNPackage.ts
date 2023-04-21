import { TurboModule, TurboModuleContext } from "./TurboModule";

export abstract class TurboModulesFactory {
  constructor(protected ctx: TurboModuleContext) { }

  abstract createTurboModule(name: string): TurboModule | null;

  abstract hasTurboModule(name: string): boolean;
}

export type RNPackageContext = TurboModuleContext;

export abstract class RNPackage {
  constructor(protected ctx: RNPackageContext) { };

  abstract createTurboModulesFactory(ctx: TurboModuleContext): TurboModulesFactory;
}