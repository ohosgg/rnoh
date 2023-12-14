import type { TurboModuleContext } from "../../RNOH/TurboModule";
import { TurboModule } from "../../RNOH/TurboModule";
import window from '@ohos.window';

import { convertColorValueToHex, EventEmitter } from '../../RNOH/ts';


type StatusBarConstants = {
  DEFAULT_BACKGROUND_COLOR: string,
  HEIGHT: number,
}

declare function px2vp(px: number): number;

type StatusBarEventNameByListenerArgs = {
  SYSTEM_BAR_VISIBILITY_CHANGE: [{ hidden: boolean }]
}

export class StatusBarTurboModule extends TurboModule {
  public static readonly NAME = 'StatusBarManager';

  private constants?: StatusBarConstants = null;
  private eventEmitter = new EventEmitter<StatusBarEventNameByListenerArgs>()
  private _isStatusBarHidden = false

  constructor(protected ctx: TurboModuleContext) {
    super(ctx);
    this.setConstants();
  }

  private async setConstants() {
    const windowInstance = await window.getLastWindow(this.ctx.uiAbilityContext);
    try {
      const statusBarHeight = windowInstance.getWindowAvoidArea(window.AvoidAreaType.TYPE_SYSTEM).topRect.height;

      const scaledStatusBarHeight = px2vp(statusBarHeight);
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
    this.ctx.logger.error('Not supported. StatusBar is translucent by default. Use SafeAreaView.');
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
      this._isStatusBarHidden = hidden
      this.eventEmitter.emit("SYSTEM_BAR_VISIBILITY_CHANGE", { hidden })
      this.ctx.logger.info('Succeeded in setting the system bar to be hidden.');
    } catch (exception) {
      this.ctx.logger.error('Failed to set the status bar to be hidden. Cause:' + JSON.stringify(exception));
    }
  }

  public subscribe<TEventType extends keyof StatusBarEventNameByListenerArgs>(eventType: TEventType, listener: (...args: StatusBarEventNameByListenerArgs[TEventType]) => void,
  ) {
    return this.eventEmitter.subscribe(eventType, listener)
  }

  public isStatusBarHidden() {
    return this._isStatusBarHidden
  }
}