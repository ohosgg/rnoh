import {DescriptorRegistry} from './DescriptorRegistry';
import {CommandDispatcher} from './CommandDispatcher';
import { Descriptor } from './descriptor';

export type RootDescriptor = Descriptor<"RootView", any>

const rootDescriptor: RootDescriptor = {
  type: 'RootView',
  tag: 1,
  childrenTags: [],
  props: {top: 0, left: 0, width: 0, height: 0},
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
  descriptorRegistry: DescriptorRegistry;
  commandDispatcher: CommandDispatcher;

  constructor() {
    this.descriptorRegistry = new DescriptorRegistry({
      '1': {...rootDescriptor},
    });
    this.commandDispatcher = new CommandDispatcher();
  }
}
