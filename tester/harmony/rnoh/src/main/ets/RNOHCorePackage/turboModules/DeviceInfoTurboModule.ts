import display from '@ohos.display';
import window from '@ohos.window';
import Device from '@system.device';
import type { TurboModuleContext } from "../../RNOH/TurboModule";
import { TurboModule } from "../../RNOH/TurboModule";

export type DisplayMetrics = {
  windowPhysicalPixels: PhysicalPixels,
  screenPhysicalPixels: PhysicalPixels,
};

export type PhysicalPixels = {
  width: number,
  height: number,
  scale: number,
  fontScale: number,
  densityDpi: number,
}


const defaultDisplayMetrics: DisplayMetrics = {
  windowPhysicalPixels: {
    width: 0,
    height: 0,
    scale: 1,
    fontScale: 1,
    densityDpi: 480,
  },
  screenPhysicalPixels: {
    width: 0,
    height: 0,
    scale: 1,
    fontScale: 1,
    densityDpi: 480
  },

} as const;

export class DeviceInfoTurboModule extends TurboModule {
  public static readonly NAME = 'DeviceInfo';

  static async create(ctx: TurboModuleContext) {
    const displayInstance = display.getDefaultDisplaySync();
    const windowInstance = await window.getLastWindow(ctx.uiAbilityContext);
    const windowProperties = windowInstance.getWindowProperties();

    const initialDisplayMetrics = { screenPhysicalPixels: {
      width: displayInstance.width,
      height: displayInstance.height,
      scale: displayInstance.densityPixels,
      fontScale: 1,
      densityDpi: displayInstance.densityDPI,
    },
      windowPhysicalPixels: {
        width: windowProperties.windowRect.width,
        height: windowProperties.windowRect.height,
        scale: displayInstance.densityPixels,
        fontScale: 1,
        densityDpi: displayInstance.densityDPI,
      } };
    return new DeviceInfoTurboModule(ctx, initialDisplayMetrics, windowInstance)
  }

  private displayMetrics?: DisplayMetrics = null;
  private cleanUpCallbacks?: (() => void)[] = []

  constructor(protected ctx: TurboModuleContext, initialDisplayMetrics: DisplayMetrics, windowInstance: window.Window) {
    super(ctx);
    this.displayMetrics = initialDisplayMetrics;
    const updateDeviceMetrics = () => this.updateDeviceMetrics()
    this.cleanUpCallbacks.push(
      this.ctx.rnInstance.subscribeToLifecycleEvents("CONFIGURATION_UPDATE", updateDeviceMetrics)
    )
    windowInstance.on("windowSizeChange", updateDeviceMetrics)
    this.cleanUpCallbacks.push(() => {
      windowInstance.off("windowSizeChange", updateDeviceMetrics)
    })
  }

  __onDestroy__() {
    super.__onDestroy__()
    this.cleanUpCallbacks.forEach(cb => cb())
  }

  getConstants() {
    if (!this.displayMetrics) {
      this.ctx.logger.error("DeviceInfoTurboModule::getConstants: JS Display Metrics not set");
    }
    return {
      Dimensions: {
        windowPhysicalPixels: this.displayMetrics.windowPhysicalPixels ?? defaultDisplayMetrics.windowPhysicalPixels,
        screenPhysicalPixels: this.displayMetrics.screenPhysicalPixels ?? defaultDisplayMetrics.screenPhysicalPixels,
      }
    };
  }

  async updateDeviceMetrics() {
    try {
      const displayInstance = display.getDefaultDisplaySync();
      const windowInstance = await window.getLastWindow(this.ctx.uiAbilityContext);
      const windowProperties = windowInstance.getWindowProperties();

      this.displayMetrics.screenPhysicalPixels = {
        width: displayInstance.width,
        height: displayInstance.height,
        densityDpi: displayInstance.densityDPI,
        scale: displayInstance.densityPixels,
        fontScale: 1,
      }
      this.displayMetrics.windowPhysicalPixels = {
        width: windowProperties.windowRect.width,
        height: windowProperties.windowRect.height,
        densityDpi: displayInstance.densityDPI,
        scale: displayInstance.densityPixels,
        fontScale: 1,
      }
      this.ctx.rnInstanceManager.emitDeviceEvent("didUpdateDimensions", this.displayMetrics);
    } catch (err) {
      this.ctx.logger.error('DeviceInfoTurboModule::updateDeviceMetrics: Failed to update display size ' + JSON.stringify(err));
    }
  }
}



