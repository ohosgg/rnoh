import { TurboModule } from "../../RNOH/TurboModule";

export class DeviceEventManagerTurboModule extends TurboModule {
  public static readonly NAME = 'DeviceEventManager';

  invokeDefaultBackPressHandler() {
    this.ctx.uiAbilityContext.terminateSelf();
  }

  emitHardwareBackPressed() {
    this.ctx.rnInstanceManager.emitDeviceEvent('hardwareBackPress', {})
  }
}
