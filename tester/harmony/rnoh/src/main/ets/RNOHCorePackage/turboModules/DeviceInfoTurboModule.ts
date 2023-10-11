import display from '@ohos.display';
import window from '@ohos.window';
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

  private displayMetrics?: DisplayMetrics = null;

  constructor(protected ctx: TurboModuleContext) {
    super(ctx);
    this.setInitialParameters()
    this.ctx.rnInstance.subscribeToLifecycleEvents("CONFIGURATION_UPDATE", () => {
      this.updateDeviceMetrics();
    });
  }

  getConstants() {
    if (!this.displayMetrics) {
      this.ctx.logger.error("JS Display Metrics not set");
    }
    return {
      Dimensions: {
        windowPhysicalPixels: this.displayMetrics.windowPhysicalPixels ?? defaultDisplayMetrics.windowPhysicalPixels,
        screenPhysicalPixels: this.displayMetrics.screenPhysicalPixels ?? defaultDisplayMetrics.screenPhysicalPixels,
      }
    };
  }

  setInitialParameters() {
    const displayProps = display.getDefaultDisplaySync();
    this.displayMetrics = { screenPhysicalPixels: {
      width: displayProps.width,
      height: displayProps.height,
      scale: displayProps.densityPixels,
      fontScale: 1,
      densityDpi: displayProps.densityDPI,
    },
      windowPhysicalPixels: {
        width: displayProps.width,
        height: displayProps.height,
        scale: displayProps.densityPixels,
        fontScale: 1,
        densityDpi: displayProps.densityDPI,
      } };
  }

  async updateDeviceMetrics() {
    try {
      const displayInstances = await display.getAllDisplays()
      const displayInstance = displayInstances[0];
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
      this.ctx.logger.error('Failed to update display size ' + JSON.stringify(err));
    }
  }
}



