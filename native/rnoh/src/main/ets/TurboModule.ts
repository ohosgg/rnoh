import {RNInstance} from './RNInstance'

export interface TurboModuleContext {
  reactNativeVersion: string;
  rnInstance: RNInstance;
}

export class TurboModule {
  constructor(protected ctx: TurboModuleContext) { };
}