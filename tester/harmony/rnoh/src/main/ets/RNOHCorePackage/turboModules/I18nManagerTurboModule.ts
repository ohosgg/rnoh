import I18n from '@ohos.i18n';
import { TurboModule } from "../../RNOH/TurboModule";

export class I18nManagerTurboModule extends TurboModule {
  public static readonly NAME = 'I18nManager';

  getConstants() {
    return {
      isRTL: I18n.isRTL(this.ctx.uiAbilityContext.config.language),
      doLeftAndRightSwapInRTL: true
    };
  }
}
