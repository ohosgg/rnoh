import Device from '@system.device';
import commonEventManager from '@ohos.commonEventManager';
import { TurboModule, TurboModuleContext } from "../../TurboModule";

export type DisplayMetrics = {
  width: number,
  height: number,
  scale: number,
  fontScale: number,
};

const defaultDisplayMetrics: DisplayMetrics = {
  width: 0,
  height: 0,
  scale: 1,
  fontScale: 1,
} as const;

export class DeviceInfoTurboModule extends TurboModule {
  private displayMetrics?: DisplayMetrics = null;

  constructor(protected ctx: TurboModuleContext) {
    super(ctx);
    commonEventManager.createSubscriber({ events: [commonEventManager.Support.COMMON_EVENT_CONFIGURATION_CHANGED] }, (_err, subscriber) => {
      commonEventManager.subscribe(subscriber, (err, data) => {
        this.updateDeviceMetrics();
      });
    });
  }

  getConstants() {
    if (!this.displayMetrics) {
      console.error("RNOH::JS Display Metrics not set");
    }
    return {
      Dimensions: {
        window: this.displayMetrics ?? defaultDisplayMetrics,
        screen: this.displayMetrics ?? defaultDisplayMetrics,
        windowPhysicalPixels: undefined,
        screenPhysicalPixels: undefined,
      }
    };
  }

  setInitialDeviceMetrics(displayMetrics: DisplayMetrics) {
    this.displayMetrics = displayMetrics;
  }

  private updateDeviceMetrics() {
    Device.getInfo({
      success: (data) => {
        this.displayMetrics.width = data.windowWidth;
        this.displayMetrics.height = data.windowHeight;
        this.displayMetrics.scale = data.screenDensity;
        this.displayMetrics.fontScale = data.screenDensity;
      },
    });
  }
}

