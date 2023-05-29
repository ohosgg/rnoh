import UIAbility from '@ohos.app.ability.UIAbility';
import RNOHLogger from './RNOHLogger';

export class RNAbility extends UIAbility {
    // TODO: figure out a way to pass this to the application
    // without storing in a static
    public static abilityContext : UIAbility['context']

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

    onForeground() {
        // Ability has brought to foreground
        RNOHLogger.info('Ability onForeground');
    }

    onBackground() {
        // Ability has back to background
        RNOHLogger.info('Ability onBackground');
    }

}
