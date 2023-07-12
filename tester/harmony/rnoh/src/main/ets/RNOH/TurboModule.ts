import { RNOHContext } from './RNOHContext';

export type TurboModuleContext = RNOHContext;

export class TurboModule {
  constructor(protected ctx: TurboModuleContext) {
  };
}
