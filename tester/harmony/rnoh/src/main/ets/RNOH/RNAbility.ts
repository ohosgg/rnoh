import UIAbility from '@ohos.app.ability.UIAbility';
import { NapiBridge } from "./NapiBridge"
import { StandardRNOHLogger, RNOHLogger } from "./RNOHLogger"
import window from '@ohos.window';
import hilog from '@ohos.hilog';
import { TurboModuleProvider } from "./TurboModuleProvider"
import libRNOHApp from 'librnoh_app.so'
import { RNInstanceRegistry } from './RNInstanceRegistry';
import { LifecycleEventListenerByName } from './RNInstance';

export abstract class RNAbility extends UIAbility {
  protected storage: LocalStorage
  protected napiBridge: NapiBridge = null
  protected turboModuleProvider: TurboModuleProvider
  protected logger: RNOHLogger
  protected rnInstanceRegistry: RNInstanceRegistry

  onCreate(want, param) {
    this.logger = this.createLogger()
    this.napiBridge = new NapiBridge(libRNOHApp)
    this.rnInstanceRegistry = new RNInstanceRegistry(this.logger, this.napiBridge, this.context)
    AppStorage.setOrCreate('RNOHLogger', this.logger)
    AppStorage.setOrCreate('RNInstanceFactory', this.rnInstanceRegistry)
    AppStorage.setOrCreate('RNAbility', this)
  }

  protected createLogger(): RNOHLogger {
    return new StandardRNOHLogger();
  }

  onWindowStageCreate(windowStage: window.WindowStage) {
    windowStage.loadContent(this.getPagePath(), this.storage, (err, data) => {
      if (err.code) {
        hilog.error(0x0000, 'RNOH', 'Failed to load the content. Cause: %{public}s', JSON.stringify(err) ?? '');
        return;
      }
      hilog.info(0x0000, 'RNOH', 'Succeeded in loading the content. Data: %{public}s', JSON.stringify(data) ?? '');
    });
  }

  onMemoryLevel(level) {
    const MEMORY_LEVEL_NAMES = ["MEMORY_LEVEL_MODERATE", "MEMORY_LEVEL_LOW", "MEMORY_LEVEL_CRITICAL"]
    this.logger.debug("Received memory level event: " + MEMORY_LEVEL_NAMES[level])
    this.napiBridge.onMemoryLevel(level)
  }

  private emitLifecycleEvent<TEventName extends keyof LifecycleEventListenerByName>(type: TEventName, ...data: Parameters<LifecycleEventListenerByName[TEventName]>) {
    this.context.eventHub.emit(type, ...data)
  }

  onConfigurationUpdate(config) {
    this.emitLifecycleEvent("CONFIGURATION_UPDATE", config);
  }

  onForeground() {
    this.rnInstanceRegistry.onForeground();
    this.emitLifecycleEvent("FOREGROUND");
  }

  onBackground() {
    this.rnInstanceRegistry.onBackground();
    this.emitLifecycleEvent("BACKGROUND");
  }

  onBackPress() {
    this.rnInstanceRegistry.onBackPress()
    return true;
  }

  abstract getPagePath(): string
}
