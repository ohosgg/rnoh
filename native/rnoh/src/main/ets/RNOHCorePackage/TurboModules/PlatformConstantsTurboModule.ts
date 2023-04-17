import deviceInfo from "@ohos.deviceInfo";
import { TurboModule } from "../../TurboModule";

export class PlatformConstantsTurboModule extends TurboModule {
  getConstants() {
    return {
      deviceType: deviceInfo.deviceType,
      osFullName: deviceInfo.osFullName,
      isTesting: false,
      reactNativeVersion: this.ctx.reactNativeVersion
    };
  }
}