import UIAbility from '@ohos.app.ability.UIAbility';
import { RNPackage, RNPackageContext } from "./RNPackage";
import { RNOHContext } from "./RNOHContext"
import { NapiBridge } from "./NapiBridge"
import { Tag } from "./DescriptorBase"
import { StandardRNOHLogger, RNOHLogger } from "./RNOHLogger"
import JavaScriptLoader from "./JavaScriptLoader"
import window from '@ohos.window';
import hilog from '@ohos.hilog';
import { TurboModule, TurboModuleContext } from "./TurboModule"
import { TurboModuleProvider } from "./TurboModuleProvider"
import { RNOHCorePackage } from "../RNOHCorePackage/ts";
import libRNOHApp from 'librnoh_app.so'

export type SurfaceAboutToAppearContext = {
  appName: string
  width: number
  height: number
  screenDensity: number
}

export interface SurfaceLifecycle {
  onSurfaceAboutToAppear(ctx: SurfaceAboutToAppearContext);
}

export enum LifecycleState {
  BEFORE_CREATE,
  PAUSED,
  READY,
}

interface LifecycleEventListenerByName {
  CONFIGURATION_UPDATE: (...args: Parameters<UIAbility["onConfigurationUpdate"]>) => void;
  FOREGROUND: () => void;
  BACKGROUND: () => void;
}

export interface RNInstanceManager {
  getLifecycleState(): LifecycleState

  getBundleURL(): string

  getInitialProps(): Record<string, any>

  subscribeToLifecycleEvents: <TEventName extends keyof LifecycleEventListenerByName>(
    eventName: TEventName,
    listener: LifecycleEventListenerByName[TEventName]
  ) => () => void

  emitDeviceEvent(eventName: string, payload: any): void

  emitComponentEvent(tag: Tag, eventEmitRequestHandlerName: string, payload: any): void

  loadScriptFromString(script: string, sourceURL?: string);

  getTurboModule<T extends TurboModule>(name: string): T

  onBackPress(): void
}


export abstract class RNAbility extends UIAbility implements SurfaceLifecycle, RNInstanceManager {
  protected storage: LocalStorage
  protected napiBridge: NapiBridge = null
  protected lifecycleState = LifecycleState.BEFORE_CREATE
  protected turboModuleProvider: TurboModuleProvider
  protected logger: RNOHLogger

  onCreate(want, param) {
    this.logger = this.createLogger()
    this.napiBridge = new NapiBridge(libRNOHApp)
    this.storage = new LocalStorage()

    const rnohContext = new RNOHContext("0.0.0", this.napiBridge, this.context, this, this, this.logger)

    this.turboModuleProvider = this.processPackages(rnohContext).turboModuleProvider
    this.napiBridge.registerTurboModuleProvider(this.turboModuleProvider)
    this.storage.setOrCreate('RNOHContext', rnohContext)
  }

  public createLogger(): RNOHLogger {
    return new StandardRNOHLogger();
  }

  private processPackages(turboModuleContext: TurboModuleContext) {
    const packages = this.createPackages({});
    packages.unshift(new RNOHCorePackage({}));
    return {
      turboModuleProvider: new TurboModuleProvider(packages.map((pkg) => {
        return pkg.createTurboModulesFactory(turboModuleContext);
      }))
    }
  }

  subscribeToLifecycleEvents<TEventName extends keyof LifecycleEventListenerByName>(type: TEventName, listener: LifecycleEventListenerByName[TEventName]) {
    this.context.eventHub.on(type, listener);
    return () => {
      this.context.eventHub.off(type, listener)
    }
  }

  getInitialProps(): Record<string, any> {
    return { concurrentRoot: true }
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
    const MEMORY_LEVEL_NAMES = [ "MEMORY_LEVEL_MODERATE", "MEMORY_LEVEL_LOW", "MEMORY_LEVEL_CRITICAL" ]
    this.logger.debug("Received memory level event: "+MEMORY_LEVEL_NAMES[level])
    this.napiBridge.onMemoryLevel(level)
  }

  private emitLifecycleEvent<TEventName extends keyof LifecycleEventListenerByName>(type: TEventName, ...data: Parameters<LifecycleEventListenerByName[TEventName]>) {
    this.context.eventHub.emit(type, ...data)
  }

  onConfigurationUpdate(config) {
    this.emitLifecycleEvent("CONFIGURATION_UPDATE", config);
  }

  onForeground() {
    this.lifecycleState = LifecycleState.READY
    this.emitLifecycleEvent("FOREGROUND");
  }

  onBackground() {
    this.lifecycleState = LifecycleState.PAUSED;
    this.emitLifecycleEvent("BACKGROUND");
  }

  abstract getPagePath(): string

  createPackages(ctx: RNPackageContext): RNPackage[] {
    return []
  }

  getBundleURL(): string {
    return "http://localhost:8081/index.bundle?platform=harmony&dev=false&minify=false"
  }

  getLifecycleState() {
    return this.lifecycleState
  }

  emitComponentEvent(tag: Tag, eventEmitRequestHandlerName: string, payload: any) {
    this.napiBridge.emitComponentEvent(tag, eventEmitRequestHandlerName, payload)
  }

  emitDeviceEvent(eventName: string, params: any) {
    this.napiBridge.callRNFunction("RCTDeviceEventEmitter", "emit", [eventName, params]);
  }

  loadScriptFromString(script: string, sourceURL = "bundle.harmony.js") {
    this.napiBridge.loadScriptFromString(script, sourceURL);
  }

  onSurfaceAboutToAppear(ctx: SurfaceAboutToAppearContext) {
    const javaScriptLoader = new JavaScriptLoader(this.context.resourceManager, this.logger);
    javaScriptLoader.loadBundle(this.getBundleURL())
      .catch((error) => {
        // NOTE: temporary fallback to local bundle file,
        // until we figure out how to pass bundle URL as launch param
        // to the Ark app
        this.logger.error(error);
        this.logger.info("Falling back to local bundle.");
        return javaScriptLoader.loadBundle("bundle.harmony.js")
      }).then((bundle) => {
      this.loadScriptFromString(bundle)
      this.napiBridge.run(ctx.width / ctx.screenDensity,
        ctx.height / ctx.screenDensity,
        ctx.appName,
        this.getInitialProps())
    }).catch((error) => {
      this.logger.error(error)
      // TODO: don't use empty string as a magic "failure" value
      this.loadScriptFromString("")
      this.napiBridge.run(ctx.width / ctx.screenDensity,
        ctx.height / ctx.screenDensity,
        ctx.appName,
        this.getInitialProps())
    });
    this.lifecycleState = LifecycleState.READY
  }

  getTurboModule<T extends TurboModule>(name: string): T {
    return this.turboModuleProvider.getModule(name);
  }

  onBackPress() {
    this.emitDeviceEvent('hardwareBackPress', {})
  }
}
