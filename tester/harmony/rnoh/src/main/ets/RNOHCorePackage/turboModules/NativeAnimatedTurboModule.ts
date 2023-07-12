import { Tag } from '../../RNOH';
import { TurboModule } from "../../RNOH/TurboModule";

export class NativeAnimatedTurboModule extends TurboModule {
  public scheduleNextFrame(callback: () => void) {
    setTimeout(callback, 12);
  }

  public setViewProps(tag: Tag, props: Object) {
    const viewProps = {
      // flatten the style attribute
      ...(props['style'] ?? {})
    };
    this.ctx.descriptorRegistry.setProps(tag, viewProps);
  }
}
