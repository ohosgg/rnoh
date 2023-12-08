import type { TurboModuleContext } from "../../RNOH/TurboModule";
import { TurboModule } from "../../RNOH/TurboModule";
import ConfigurationConstant from '@ohos.app.ability.ConfigurationConstant';
import type EnvironmentCallback from '@ohos.app.ability.EnvironmentCallback';

export class AppearanceTurboModule extends TurboModule {
  public static readonly NAME = 'Appearance';

  constructor(protected ctx: TurboModuleContext) {
    super(ctx);
    this.setup();
  }

  getColorScheme(): string {
    this.ctx.logger.error('Appearance::getColorScheme not supported')
    return 'light';
  }

  setup(): void {
    let envCallback : EnvironmentCallback = {
      onConfigurationUpdated(config) {
        const colorMode = config.colorMode;
        let colorScheme: string | null = null;
        if (colorMode === ConfigurationConstant.ColorMode.COLOR_MODE_LIGHT) {
          colorScheme = 'light';
        } else if (colorMode === ConfigurationConstant.ColorMode.COLOR_MODE_DARK) {
          colorScheme = 'dark';
        }
        this.ctx.rnInstance.emitDeviceEvent("appearanceChanged", {
          colorScheme: colorScheme
        });

      },
      onMemoryLevel() {
      }
    };

    let applicationContext = this.ctx.uiAbilityContext.getApplicationContext();
    applicationContext.on('environment', envCallback);
  }

  setColorScheme(colorScheme: string) : void {
    throw new Error('Appearance::setColorScheme not supported')
  };
}
