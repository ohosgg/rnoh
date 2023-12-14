import type { Tag } from '../../RNOH/ts';
import { TurboModule } from "../../RNOH/TurboModule";

export class NativeAnimatedTurboModule extends TurboModule {
  public static readonly NAME = 'NativeAnimatedTurboModule';

  public setViewProps(tag: Tag, props: Object) {
    this.ctx.descriptorRegistry.setAnimatedRawProps(tag, props);
  }
}
