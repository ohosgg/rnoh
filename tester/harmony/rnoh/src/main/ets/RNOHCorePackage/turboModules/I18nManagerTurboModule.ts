import I18n from '@ohos.i18n';
import { TurboModule, TurboModuleContext } from "../../RNOH/TurboModule";
import windowUtils from '@ohos.window';

export class I18nManagerTurboModule extends TurboModule {
  public static readonly NAME = 'I18nManager';

  public static async create(ctx: TurboModuleContext) {
    const windowInstance = await windowUtils.getLastWindow(ctx.uiAbilityContext);
    await new Promise<void>((resolve) => {
      windowInstance.getUIContext().runScopedTask(() => {
        Environment.envProp('languageCode', 'en')
        resolve()
      })
    })
    return new I18nManagerTurboModule(ctx)
  }

  getConstants() {
    return {
      isRTL: I18n.isRTL(AppStorage.get<string>("languageCode"))
    };
  }
}
