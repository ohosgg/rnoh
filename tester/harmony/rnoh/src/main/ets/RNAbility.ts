import UIAbility from '@ohos.app.ability.UIAbility';
import { RNPackage, RNPackageContext } from "./RNPackage";
import { RNOHContext } from "./RNOHContext"
import { RNInstance } from "./RNInstance"
import { Tag } from "./descriptor"
import RNOHLogger from "./RNOHLogger"
import JavaScriptLoader from "./JavaScriptLoader"
import window from '@ohos.window';
import hilog from '@ohos.hilog';
import { TurboModuleProvider } from "./TurboModuleProvider"
import { RNOHCorePackage } from "./RNOHCorePackage";


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

export interface RNInstanceManager {
  getLifecycleState(): LifecycleState

  getBundleURL(): string

  getInitialProps(): Record<string, any>
}


export abstract class RNAbility extends UIAbility implements SurfaceLifecycle, RNInstanceManager {
  // TODO: figure out a way to pass this to the application
  // without storing in a static
  public static abilityContext: UIAbility['context'];
  static readonly FOREGROUND_EVENT = 'ON_FOREGROUND';
  static readonly BACKGROUND_EVENT = 'ON_BACKGROUND';
  static readonly CONFIGURATION_UPDATE_EVENT = 'CONFIGURATION_UPDATE';

  protected storage: LocalStorage
  protected rnInstance: RNInstance = null
  protected lifecycleState = LifecycleState.BEFORE_CREATE
  protected turboModuleProvider: TurboModuleProvider

  onCreate(want, param) {
    RNAbility.abilityContext = this.context;
    this.storage = new LocalStorage()
    this.rnInstance = new RNInstance()
    this.turboModuleProvider = this.processPackages(this.rnInstance).turboModuleProvider
    this.rnInstance.setTurboModuleProvider(this.turboModuleProvider)
    this.storage.setOrCreate('RNOHContext', new RNOHContext(this.rnInstance, this, this))
  }

  private processPackages(rnInstance: RNInstance) {
    const ctx: RNPackageContext = {
      reactNativeVersion: "0.0.0",
      rnInstance: rnInstance,
      uiAbilityContext: this.context,
      rnInstanceManager: this
    };
    const packages = this.createPackages(ctx);
    packages.unshift(new RNOHCorePackage(ctx));
    return {
      turboModuleProvider: new TurboModuleProvider(packages.map((pkg) => {
        return pkg.createTurboModulesFactory(ctx);
      }))
    }
  }

  getInitialProps() {
    return {}
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

  onConfigurationUpdate(config) {
    this.context.eventHub.emit(RNAbility.CONFIGURATION_UPDATE_EVENT);
  }

  onForeground() {
    this.lifecycleState = LifecycleState.READY
    this.context.eventHub.emit(RNAbility.FOREGROUND_EVENT);
  }

  onBackground() {
    this.lifecycleState = LifecycleState.PAUSED
    this.context.eventHub.emit(RNAbility.BACKGROUND_EVENT);
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
    this.rnInstance.emitComponentEvent(tag, eventEmitRequestHandlerName, payload)
  }

  onSurfaceAboutToAppear(ctx: SurfaceAboutToAppearContext) {
    const javaScriptLoader = new JavaScriptLoader();
    javaScriptLoader.loadBundle(this.getBundleURL())
      .catch((error) => {
        // NOTE: temporary fallback to local bundle file,
        // until we figure out how to pass bundle URL as launch param
        // to the Ark app
        RNOHLogger.error(error);
        RNOHLogger.info("Falling back to local bundle.");
        return javaScriptLoader.loadBundle("bundle.harmony.js")
      }).then((bundle) => {
      this.rnInstance.run(ctx.width / ctx.screenDensity,
        ctx.height / ctx.screenDensity,
        bundle,
        ctx.appName,
        this.getInitialProps())
    }).catch((error) => {
      RNOHLogger.error(error)
      // TODO: don't use empty string as a magic "failure" value
      this.rnInstance.run(ctx.width / ctx.screenDensity,
        ctx.height / ctx.screenDensity,
        "",
        ctx.appName,
        this.getInitialProps())
    });
    this.lifecycleState = LifecycleState.READY
  }
}
