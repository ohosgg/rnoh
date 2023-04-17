export interface TurboModuleContext {
  reactNativeVersion: string;
}

export class TurboModule {
  constructor(protected ctx: TurboModuleContext) { };
}