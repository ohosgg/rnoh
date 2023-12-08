import UIAbility from '@ohos.app.ability.UIAbility';
import { NapiBridge } from "./NapiBridge"
import type { RNOHLogger } from "./RNOHLogger";
import { StandardRNOHLogger } from "./RNOHLogger"
import window from '@ohos.window';
import hilog from '@ohos.hilog';
import type { TurboModuleProvider } from "./TurboModuleProvider"
import libRNOHApp from 'librnoh_app.so'
import { RNInstanceRegistry } from './RNInstanceRegistry';
import { RNInstance, RNInstanceOptions, RNInstanceImpl } from './RNInstance';
import { RNOHContext } from "./RNOHContext"

const RNOH_BANNER = '\n\n\n' +
  '██████╗ ███╗   ██╗ ██████╗ ██╗  ██╗' + '\n' +
  '██╔══██╗████╗  ██║██╔═══██╗██║  ██║' + '\n' +
  '██████╔╝██╔██╗ ██║██║   ██║███████║' + '\n' +
  '██╔══██╗██║╚██╗██║██║   ██║██╔══██║' + '\n' +
  '██║  ██║██║ ╚████║╚██████╔╝██║  ██║' + '\n' +
  '╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝' + '\n\n'

export abstract class RNAbility extends UIAbility {
  protected storage: LocalStorage
  protected napiBridge: NapiBridge = null
  protected turboModuleProvider: TurboModuleProvider
  protected providedLogger: RNOHLogger
  protected logger: RNOHLogger
  protected rnInstanceRegistry: RNInstanceRegistry
  protected window: window.Window | undefined
  protected initializationDateTime: Date
  protected readinessDateTime: Date | undefined

  async onCreate(want, param) {
    this.initializationDateTime = new Date()
    this.providedLogger = this.createLogger()
    this.providedLogger.info(RNOH_BANNER)
    this.logger = this.providedLogger.clone("RNAbility")
    const stopTracing = this.logger.clone("onCreate").startTracing()
    this.napiBridge = new NapiBridge(libRNOHApp, this.providedLogger)
    this.rnInstanceRegistry = new RNInstanceRegistry(
      this.providedLogger,
      this.napiBridge,
      this.context,
      (rnInstance) => this.createRNOHContext({
        rnInstance
      }))
    AppStorage.setOrCreate('RNOHLogger', this.logger)
    AppStorage.setOrCreate('RNInstanceFactory', this.rnInstanceRegistry)
    AppStorage.setOrCreate('RNAbility', this)
    stopTracing()
  }

  public markReadiness(): void {
    if (!this.readinessDateTime) {
      this.readinessDateTime = new Date()
      this.logger.warn(`START UP TIME: ${this.readinessDateTime.getTime() - this.initializationDateTime.getTime()} ms`)
    }
  }

  public async createAndRegisterRNInstance(options: RNInstanceOptions): Promise<RNInstance> {
    const stopTracing = this.logger.clone("createAndRegisterRNInstance").startTracing()
    const result = await this.rnInstanceRegistry.createInstance(options)
    stopTracing()
    return result
  }

  public destroyAndUnregisterRNInstance(rnInstance: RNInstance): void {
    const stopTracing = this.logger.clone("destroyAndUnregisterRNInstance").startTracing()
    if (rnInstance instanceof RNInstanceImpl) {
      rnInstance.onDestroy()
    }
    this.rnInstanceRegistry.deleteInstance(rnInstance.getId())
    stopTracing()
  }

  public createRNOHContext({rnInstance}: { rnInstance: RNInstance }) {
    if (!(rnInstance instanceof RNInstanceImpl)) {
      throw new Error("RNInstance must extends RNInstanceImpl")
    }
    return new RNOHContext("0.72.5", rnInstance, this.providedLogger, this)
  }

  protected createLogger(): RNOHLogger {
    return new StandardRNOHLogger();
  }

  public getLogger(): RNOHLogger {
    return this.providedLogger
  }

  public async onWindowSetup(win: window.Window) {
    const stopTracing = this.logger.clone("onWindowSetup").startTracing()
    await win.setWindowLayoutFullScreen(true)
    stopTracing()
  }

  onWindowStageCreate(windowStage: window.WindowStage) {
    const logger = this.logger.clone("onWindowStageCreate")
    const stopTracing = logger.startTracing()
    const mainWindow = windowStage.getMainWindowSync()
    this.onWindowSetup(mainWindow).then(async () => {
      windowStage.loadContent(this.getPagePath(), (err, data) => {
        if (err.code) {
          logger.error("Failed to load the content", err.code)
          return;
        }
        logger.info("Succeeded in loading the content", JSON.stringify(data))
      });

    }).catch((err: Error) => {
      logger.error("Failed to setup window", JSON.stringify(err))
    }).finally(() => {
      stopTracing()
    })
  }

  onMemoryLevel(level) {
    const stopTracing = this.logger.clone("onWindowStageCreate").startTracing()
    const MEMORY_LEVEL_NAMES = ["MEMORY_LEVEL_MODERATE", "MEMORY_LEVEL_LOW", "MEMORY_LEVEL_CRITICAL"]
    this.logger.debug("Received memory level event: " + MEMORY_LEVEL_NAMES[level])
    this.napiBridge.onMemoryLevel(level)
    stopTracing()
  }

  onConfigurationUpdate(config) {
    const stopTracing = this.logger.clone("onConfigurationUpdate").startTracing()
    this.rnInstanceRegistry.forEach((rnInstance) => rnInstance.onConfigurationUpdate(config))
    stopTracing()
  }

  onForeground() {
    const stopTracing = this.logger.clone("onForeground").startTracing()
    this.rnInstanceRegistry.forEach((rnInstance) => rnInstance.onForeground())
    stopTracing()
  }

  onBackground() {
    const stopTracing = this.logger.clone("onBackground").startTracing()
    this.rnInstanceRegistry.forEach((rnInstance) => rnInstance.onBackground())
    stopTracing()
  }

  onBackPress() {
    const stopTracing = this.logger.clone("onBackPress").startTracing()
    this.rnInstanceRegistry.forEach((rnInstance) => rnInstance.onBackPress())
    stopTracing()
    return true;
  }

  abstract getPagePath(): string
}
