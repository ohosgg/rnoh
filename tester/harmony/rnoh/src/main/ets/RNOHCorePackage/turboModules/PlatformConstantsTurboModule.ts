import deviceInfo from "@ohos.deviceInfo";
import { TurboModule } from "../../RNOH/TurboModule";

export class PlatformConstantsTurboModule extends TurboModule {
  public static readonly NAME = 'PlatformConstants';

  getConstants() {
    return {
      deviceType: deviceInfo.deviceType,
      osFullName: deviceInfo.osFullName,
      isTesting: false,
      reactNativeVersion: this.ctx.reactNativeVersion
    };
  }
}