import UIAbility from '@ohos.app.ability.UIAbility';
import RNOHLogger from './RNOHLogger';

export class RNAbility extends UIAbility {
  // TODO: figure out a way to pass this to the application
  // without storing in a static
  public static abilityContext: UIAbility['context']
  static readonly FOREGROUND_EVENT = "ON_FOREGROUND";
  static readonly BACKGROUND_EVENT = "ON_BACKGROUND";
  static readonly CONFIGURATION_UPDATE_EVENT = "CONFIGURATION_UPDATE";


  onCreate(want, launchParam) {
    RNOHLogger.info('Ability onCreate');
    RNAbility.abilityContext = this.context;
  }

  onDestroy() {
    RNOHLogger.info('Ability onDestroy');
  }

  onWindowStageDestroy() {
    // Main window is destroyed, release UI related resources
    RNOHLogger.info('Ability onWindowStageDestroy');
  }

  onConfigurationUpdate(config) {
    this.context.eventHub.emit(RNAbility.CONFIGURATION_UPDATE_EVENT);
    RNOHLogger.info('Ability on configuration update');
  }

  onForeground() {
    // Ability has brought to foreground
    this.context.eventHub.emit(RNAbility.FOREGROUND_EVENT);
    RNOHLogger.info('Ability onForeground');
  }

  onBackground() {
    // Ability has back to background
    this.context.eventHub.emit(RNAbility.BACKGROUND_EVENT);
    RNOHLogger.info('Ability onBackground');
  }
}
