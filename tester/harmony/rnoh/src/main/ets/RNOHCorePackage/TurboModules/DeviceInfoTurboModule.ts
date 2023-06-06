import display from '@ohos.display';
import window from '@ohos.window';
import common from "@ohos.app.ability.common"
import RNOHLogger from "../../RNOHLogger"

import { EventEmittingTurboModule, TurboModuleContext } from "../../TurboModule";

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

export class DeviceInfoTurboModule extends EventEmittingTurboModule {
  supportedEvents: string[] = ["didUpdateDimensions"];

  private displayMetrics?: DisplayMetrics = null;
  private context?: common.UIAbilityContext = null;

  constructor(protected ctx: TurboModuleContext) {
    super(ctx);
  }

  getConstants() {
    if (!this.displayMetrics) {
      RNOHLogger.error("JS Display Metrics not set");
    }
    return {
      Dimensions: {
        windowPhysicalPixels: this.displayMetrics.windowPhysicalPixels ?? defaultDisplayMetrics.windowPhysicalPixels,
        screenPhysicalPixels: this.displayMetrics.screenPhysicalPixels ?? defaultDisplayMetrics.screenPhysicalPixels,
      }
    };
  }

  setInitialParameters(displayMetrics: DisplayMetrics, context: common.UIAbilityContext) {
    this.displayMetrics = displayMetrics;
    this.context = context;
  }

  async updateDeviceMetrics() {
    try {
      const displayInstances = await display.getAllDisplays()
      const displayInstance = displayInstances[0];
      const windowInstance = await window.getLastWindow(this.context);
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
      this.sendEvent('didUpdateDimensions', this.displayMetrics);
    } catch (err) {
      RNOHLogger.error('Failed to update display size ' + JSON.stringify(err));
    }
  }
}



