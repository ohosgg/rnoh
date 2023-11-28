import deviceInfo from "@ohos.deviceInfo";
import { TurboModule } from "../../RNOH/TurboModule";

export class PlatformConstantsTurboModule extends TurboModule {
  public static readonly NAME = 'PlatformConstants';

  getConstants() {
    const versionParts = this.ctx.reactNativeVersion.split('.', 3);

    return {
      Model: deviceInfo.productModel,
      deviceType: deviceInfo.deviceType,
      osFullName: deviceInfo.osFullName,
      isTesting: false,
      reactNativeVersion: {
        major: versionParts[0],
        minor: versionParts[1],
        patch: versionParts[2],
      }
    };
  }
}