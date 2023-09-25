import { TurboModule, TurboModuleContext } from "../../RNOH/TurboModule";
import window from '@ohos.window';
import display from '@ohos.display';
import { convertColorValueToHex } from '../../RNOH';

type StatusBarConstants = {
  DEFAULT_BACKGROUND_COLOR: string,
  HEIGHT: number,
}

declare function px2vp(px: number): number;

export class StatusBarTurboModule extends TurboModule {
  public static readonly NAME = 'StatusBarManager';

  private constants?: StatusBarConstants = null;

  constructor(protected ctx: TurboModuleContext) {
    super(ctx);
    this.setConstants();
  }

  private async setConstants() {
    const windowInstance = await window.getLastWindow(this.ctx.uiAbilityContext);
    try {
      const windowRect = windowInstance.getWindowProperties().windowRect;
      // we get this value in this way because other methods didn't work. I tried using window.getWindowAvoidArea but it
      // always returned 0. I didn't use display.getCutoutInfo, as not every device has cutouts.

      const scaledStatusBarHeight = px2vp(windowRect.top);
      this.constants = {
        DEFAULT_BACKGROUND_COLOR: '#0x66000000',
        HEIGHT: scaledStatusBarHeight,
      }
    } catch (exception) {
      this.ctx.logger.error('Failed to obtain the avoid area  (currentHeight). Cause:' + JSON.stringify(exception));
    }

  }

  getConstants(): StatusBarConstants {
    return this.constants ?? {
      DEFAULT_BACKGROUND_COLOR: "#00000066",
      HEIGHT: 0,
    };
  }

  async setTranslucent(translucent: boolean) {
    try {
      const windowInstance = await window.getLastWindow(this.ctx.uiAbilityContext);
      await windowInstance.setWindowLayoutFullScreen(translucent);
      this.ctx.logger.info('Succeeded in setting the window layout to full-screen mode.');
    } catch (exception) {
      this.ctx.logger.error('Failed to set the window layout to full-screen mode. Cause:' + JSON.stringify(exception));
    }
  }

  async setStyle(style: string) {
    let systemBarProperties = {
      statusBarContentColor: '#E5FFFFFF',
    };
    if (style === 'dark-content') {
      systemBarProperties.statusBarContentColor = '#000000';
    }
    try {
      const windowInstance = await window.getLastWindow(this.ctx.uiAbilityContext);
      windowInstance.setWindowSystemBarProperties(systemBarProperties);
      this.ctx.logger.info('Succeeded in setting the status bar content style.');
    }
    catch (exception) {
      this.ctx.logger.error('Failed to set the status bar content style. Cause:' + JSON.stringify(exception));
    }
  }

  async setColor(color: number) {
    const colorString = convertColorValueToHex(color);
    let systemBarProperties = {
      statusBarColor: colorString,
    };
    try {
      const windowInstance = await window.getLastWindow(this.ctx.uiAbilityContext);
      windowInstance.setWindowSystemBarProperties(systemBarProperties);
      this.ctx.logger.info('Succeeded in setting the status bar background color. Color: ' + colorString);
    }
    catch (exception) {
      this.ctx.logger.error('Failed to set the status bar background color. Cause:' + JSON.stringify(exception));
    }


  }

  async setHidden(hidden: boolean) {
    let names: Array<'status' | 'navigation'> = ['navigation'];
    if (!hidden)
      names.push('status');
    try {
      const windowInstance = await window.getLastWindow(this.ctx.uiAbilityContext);
      await windowInstance.setWindowSystemBarEnable(names);
      this.ctx.logger.info('Succeeded in setting the system bar to be hidden.');
    } catch (exception) {
      this.ctx.logger.error('Failed to set the status bar to be hidden. Cause:' + JSON.stringify(exception));
    }
  }
}