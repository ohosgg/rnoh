import { TurboModule } from "../../TurboModule";
import window from '@ohos.window';
import RNOHLogger from "../../RNOHLogger"
import { convertColorValueToHex } from '../../cpp-bridge-utils';


export class StatusBarTurboModule extends TurboModule {
  getConstants() {
    RNOHLogger.info('getConstants');
    return {
      DEFAULT_BACKGROUND_COLOR: "#00000066"
    }
  }

  async setTranslucent(translucent: boolean) {
    try {
      const windowInstance = await window.getLastWindow(this.ctx.uiAbilityContext);
      await windowInstance.setWindowLayoutFullScreen(translucent);
      RNOHLogger.info('Succeeded in setting the window layout to full-screen mode.');
    } catch (exception) {
      RNOHLogger.error('Failed to set the window layout to full-screen mode. Cause:' + JSON.stringify(exception));
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
      RNOHLogger.info('Succeeded in setting the status bar content style.');
    }
    catch (exception) {
      RNOHLogger.error('Failed to set the status bar content style. Cause:' + JSON.stringify(exception));
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
      RNOHLogger.info('Succeeded in setting the status bar background color. Color: ' + colorString);
    }
    catch (exception) {
      RNOHLogger.error('Failed to set the status bar background color. Cause:' + JSON.stringify(exception));
    }


  }

  async setHidden(hidden: boolean) {
    RNOHLogger.info('setHidden');
    let names: Array<'status' | 'navigation'> = ['navigation'];
    if (!hidden)
      names.push('status');
    try {
      const windowInstance = await window.getLastWindow(this.ctx.uiAbilityContext);
      await windowInstance.setWindowSystemBarEnable(names);
      RNOHLogger.info('Succeeded in setting the system bar to be hidden.');
    } catch (exception) {
      RNOHLogger.error('Failed to set the status bar to be hidden. Cause:' + JSON.stringify(exception));
    }
  }
}