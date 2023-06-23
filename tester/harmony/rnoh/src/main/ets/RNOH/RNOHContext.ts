import { DescriptorRegistry } from './DescriptorRegistry';
import { CommandDispatcher } from './CommandDispatcher';
import { Descriptor } from './DescriptorBase';
import { RNInstance, NapiBridge } from './NapiBridge';
import { RNOHLogger } from "./RNOHLogger";
import type { SurfaceLifecycle, RNInstanceManager } from "./RNAbility"

export type RootDescriptor = Descriptor<"RootView", any>

const rootDescriptor: RootDescriptor = {
  type: 'RootView',
  tag: 1,
  isDynamicBinder: false,
  childrenTags: [],
  props: { top: 0, left: 0, width: 0, height: 0 },
  state: {},
  layoutMetrics: {
    frame: {
      origin: {
        x: 0,
        y: 0,
      },
      size: {
        width: 0,
        height: 0,
      },
    },
  },
};


export class RNOHContext {
  public descriptorRegistry: DescriptorRegistry;
  public commandDispatcher: CommandDispatcher;

  constructor(public rnInstance: RNInstance,
              public __napiBridge: NapiBridge,
              public surfaceLifecycle: SurfaceLifecycle,
              public rnInstanceManager: RNInstanceManager,
              public logger: RNOHLogger) {
    this.descriptorRegistry = new DescriptorRegistry({
      '1': { ...rootDescriptor },
    });
    this.commandDispatcher = new CommandDispatcher();
  }
}
