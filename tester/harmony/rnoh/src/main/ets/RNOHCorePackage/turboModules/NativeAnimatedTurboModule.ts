import { Tag } from '../../RNOH';
import { TurboModule } from "../../RNOH/TurboModule";

// schedule next frame ~16ms in the future, with an adjustment for delays
// this is a temporary solution, until we figure out how to do this properly
const FRAME_DURATION = 14;

export class NativeAnimatedTurboModule extends TurboModule {
  public static readonly NAME = 'NativeAnimatedTurboModule';

  public scheduleNextFrame(callback: () => void) {
    setTimeout(() => {
      callback()
    }, FRAME_DURATION);
  }

  public setViewProps(tag: Tag, props: Object) {
    this.ctx.descriptorRegistry.setProps(tag, props);
  }
}
