import type { Tag } from '../../RNOH';
import { TurboModule } from "../../RNOH/TurboModule";

export class NativeAnimatedTurboModule extends TurboModule {
  public static readonly NAME = 'NativeAnimatedTurboModule';

  public setViewProps(tag: Tag, props: Object) {
    this.ctx.descriptorRegistry.setProps(tag, props);
  }
}
