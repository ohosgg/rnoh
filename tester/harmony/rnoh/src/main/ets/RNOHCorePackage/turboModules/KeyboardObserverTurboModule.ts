import window from '@ohos.window';
import type { TurboModuleContext } from "../../RNOH/TurboModule";
import { TurboModule } from "../../RNOH/TurboModule";

declare function px2vp(px: number): number;

export class KeyboardObserverTurboModule extends TurboModule {
  public static readonly NAME = 'KeyboardObserver';

  constructor(protected ctx: TurboModuleContext) {
    super(ctx);
    this.subscribeListeners();
  }

  private createKeyboardEvent(screenX: number, screenY: number, width: number, height: number) {
    return {
      easing: 'keyboard',
      duration: 0,
      endCoordinates: {
        screenX: px2vp(screenX),
        screenY: px2vp(screenY),
        height: px2vp(height),
        width: px2vp(width),
      }
    }
  }

  private async subscribeListeners() {
    const windowInstance = await window.getLastWindow(this.ctx.uiAbilityContext);
    // using inputMethodEngine.on('keyboardShow') and .on('keyboardHide') would be preferable, but it doesn't work at the time of writing.
    windowInstance.on('keyboardHeightChange', async (keyboardHeight) => {
      if (keyboardHeight > 0) {
        const keyboardAvoidArea = windowInstance.getWindowAvoidArea(window.AvoidAreaType.TYPE_KEYBOARD).bottomRect;
        this.ctx.rnInstance.emitDeviceEvent('keyboardDidShow', this.createKeyboardEvent(keyboardAvoidArea.left, keyboardAvoidArea.top, keyboardAvoidArea.width, keyboardAvoidArea.height));
      } else {
        const windowRect = windowInstance.getWindowProperties().windowRect;
        this.ctx.rnInstance.emitDeviceEvent('keyboardDidHide', this.createKeyboardEvent(0, windowRect.height, windowRect.width, 0))
      }
    })

  }
}

