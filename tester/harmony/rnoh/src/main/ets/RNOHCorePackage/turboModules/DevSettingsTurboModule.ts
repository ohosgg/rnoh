import { RNOHLogger } from '../../RNOH/RNOHLogger';
import type { TurboModuleContext } from '../../RNOH/TurboModule';
import { TurboModule } from '../../RNOH/TurboModule';

export class DevSettingsTurboModule extends TurboModule {
  public static readonly NAME = 'DevSettings';

  private logger: RNOHLogger

  constructor(protected ctx: TurboModuleContext) {
    super(ctx);
    this.logger = this.ctx.logger.clone("DevSettingsTurboModule")
  }

  public reload() {
    this.logger.warn("DevSettings::reload is not supported");
  }

  public reloadWithReason(reason: string) {
    this.logger.warn("DevSettings::reloadWithReason is not supported");
  }

  public onFastRefresh() {
    this.logger.warn("DevSettings::onFastRefresh is not supported");
  }

  public setHotLoadingEnabled(isHotLoadingEnabled: boolean) {
    this.logger.warn("DevSettings::setHotLoadingEnabled is not supported");
  }

  public setIsDebuggingRemotely(isDebuggingRemotelyEnabled: boolean) {
    this.logger.warn("DevSettings::setIsDebuggingRemotely is not supported");
  }

  public setProfilingEnabled(isProfilingEnabled: boolean) {
    this.logger.warn("DevSettings::setProfilingEnabled is not supported");
  }

  public toggleElementInspector() {
    this.ctx.rnInstance.emitDeviceEvent("toggleElementInspector", {});
  }

  public addMenuItem(title: string) {
    this.logger.warn("DevSettings::addMenuItem is not supported");
  }

  public addListener(eventName: string) {
    this.logger.warn("DevSettings::addListener is not supported");
  }

  public removeListeners(count: number) {
    this.logger.warn("DevSettings::removeListeners is not supported");
  }

  public setIsShakeToShowDevMenuEnabled(enabled: boolean) {
    this.logger.warn("DevSettings::setIsShakeToShowDevMenuEnabled is not supported");
  }

}