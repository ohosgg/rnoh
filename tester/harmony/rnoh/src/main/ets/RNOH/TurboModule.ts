import type { RNOHContext } from './RNOHContext';

export type TurboModuleContext = RNOHContext;

export class TurboModule {
  public static readonly NAME;

  constructor(protected ctx: TurboModuleContext) {
  };
}
