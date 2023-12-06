import type { RNOHContext } from './RNOHContext';

export type TurboModuleContext = RNOHContext;

export class TurboModule {
  public static readonly NAME;

  public constructor(protected ctx: TurboModuleContext) {
  };

  public __onDestroy__() {}
}
