import {RNPackage, TurboModulesFactory} from 'rnoh/ts';
import type {TurboModule, TurboModuleContext} from 'rnoh/ts';
import {SampleTurboModule} from './SampleTurboModule';

class SampleTurboModulesFactory extends TurboModulesFactory {
  createTurboModule(name: string): TurboModule | null {
    if (name === 'SampleTurboModule') {
      return new SampleTurboModule(this.ctx);
    }
    return null;
  }

  hasTurboModule(name: string): boolean {
    return name === 'SampleTurboModule';
  }
}

export class SamplePackage extends RNPackage {
  createTurboModulesFactory(ctx: TurboModuleContext): TurboModulesFactory {
    return new SampleTurboModulesFactory(ctx);
  }
}
