import type UIAbility from '@ohos.app.ability.UIAbility'
import type common from '@ohos.app.ability.common'
import { CommandDispatcher } from "./CommandDispatcher"
import { DescriptorRegistry } from "./DescriptorRegistry"
import { ComponentManagerRegistry } from './ComponentManagerRegistry'
import { SurfaceHandle } from './SurfaceHandle'
import { TurboModuleProvider } from './TurboModuleProvider'
import { EventEmitter } from './EventEmitter'
import type { RNOHLogger } from "./RNOHLogger"
import type { NapiBridge } from './NapiBridge'
import type { RNOHContext } from './RNOHContext'
import { RNOHCorePackage } from '../RNOHCorePackage/ts'
import { JSBundleProviderError } from './JSBundleProvider'
import type { Tag } from './DescriptorBase'
import type { RNPackage, RNPackageContext } from "./RNPackage"
import type { TurboModule } from "./TurboModule"
import type { JSBundleProvider } from "./JSBundleProvider"

export type SurfaceContext = {
  width: number
  height: number
  surfaceOffsetX: number
  surfaceOffsetY: number
}

export enum LifecycleState {
  BEFORE_CREATE,
  PAUSED,
  READY,
}

export type LifecycleEventArgsByEventName = {
  CONFIGURATION_UPDATE: Parameters<UIAbility["onConfigurationUpdate"]>
  FOREGROUND: [];
  BACKGROUND: [];
  JS_BUNDLE_EXECUTION_FINISH: [{
    jsBundleUrl: string,
    appKeys: string[]
  }];
}

export type BundleExecutionStatus = "RUNNING" | "DONE"

const rootDescriptor = {
  isDynamicBinder: false,
  type: 'RootView',
  tag: 1,
  childrenTags: [],
  rawProps: {},
  props: { top: 0, left: 0, width: 0, height: 0 },
  state: {},
  layoutMetrics: {
    frame: {
      origin: {
        x: 0,
        y: 0,
      },
      size: {
        width: 0,
        height: 0,
      }
    }
  }
}

export interface RNInstance {
  descriptorRegistry: DescriptorRegistry;
  commandDispatcher: CommandDispatcher;
  componentManagerRegistry: ComponentManagerRegistry;
  abilityContext: common.UIAbilityContext;

  getLifecycleState(): LifecycleState;

  subscribeToLifecycleEvents: <TEventName extends keyof LifecycleEventArgsByEventName>(
    eventName: TEventName,
    listener: (...args: LifecycleEventArgsByEventName[TEventName]) => void
  ) => () => void;

  callRNFunction(moduleName: string, functionName: string, args: unknown[]): void;

  emitDeviceEvent(eventName: string, payload: any): void;

  emitComponentEvent(tag: Tag, eventEmitRequestHandlerName: string, payload: any): void;

  getBundleExecutionStatus(bundleURL: string): BundleExecutionStatus | undefined

  runJSBundle(jsBundleProvider: JSBundleProvider): Promise<void>;

  getTurboModule<T extends TurboModule>(name: string): T;

  createSurface(appKey: string): SurfaceHandle;

  updateState(componentName: string, tag: Tag, state: unknown): void;

  getId(): number;
}

/**
 * @deprecated Use `RNInstance` instead.
 */
export type RNInstanceManager = RNInstance

export type RNInstanceOptions = {
  createRNPackages: (ctx: RNPackageContext) => RNPackage[]
}

export class RNInstanceImpl implements RNInstance {
  private turboModuleProvider: TurboModuleProvider
  private surfaceCounter = 0;
  private lifecycleState: LifecycleState = LifecycleState.BEFORE_CREATE
  private bundleExecutionStatusByBundleURL: Map<string, BundleExecutionStatus> = new Map()
  public descriptorRegistry: DescriptorRegistry;
  public commandDispatcher: CommandDispatcher;
  public componentManagerRegistry: ComponentManagerRegistry;
  private lifecycleEventEmitter = new EventEmitter<LifecycleEventArgsByEventName>()

  constructor(
    private id: number,
    private logger: RNOHLogger,
    public abilityContext: common.UIAbilityContext,
    private napiBridge: NapiBridge,
    private defaultProps: Record<string, any>,
    private createRNOHContext: (rnInstance: RNInstance) => RNOHContext
  ) {
    this.componentManagerRegistry = new ComponentManagerRegistry();
    this.descriptorRegistry = new DescriptorRegistry(
      {
        '1': { ...rootDescriptor },
      },
      this.updateState.bind(this),
      this
    );
    this.commandDispatcher = new CommandDispatcher();
  }

  public getId(): number {
    return this.id;
  }

  public async initialize(packages: RNPackage[]) {
    this.turboModuleProvider = (await this.processPackages(packages)).turboModuleProvider
    this.napiBridge.initializeReactNative(this.id, this.turboModuleProvider)
    this.napiBridge.subscribeToShadowTreeChanges(this.id, (mutations) => {
      this.descriptorRegistry.applyMutations(mutations)
    }, (tag, commandName, args) => {
      this.commandDispatcher.dispatchCommand(tag, commandName, args)
    })
  }

  private async processPackages(packages: RNPackage[]) {
    packages.unshift(new RNOHCorePackage({}));
    const turboModuleContext = this.createRNOHContext(this)
    return {
      turboModuleProvider: new TurboModuleProvider(
        await Promise.all(packages.map(async (pkg) => {
          const turboModuleFactory = pkg.createTurboModulesFactory(turboModuleContext);
          await turboModuleFactory.prepareEagerTurboModules()
          return turboModuleFactory
        }))
      )
    }
  }

  public subscribeToLifecycleEvents<TEventName extends keyof LifecycleEventArgsByEventName>(type: TEventName, listener: (...args: LifecycleEventArgsByEventName[TEventName]) => void) {
    return this.lifecycleEventEmitter.subscribe(type, listener)
  }

  public getLifecycleState(): LifecycleState {
    return this.lifecycleState
  }

  public callRNFunction(moduleName: string, functionName: string, args: unknown[]): void {
    this.napiBridge.callRNFunction(this.id, moduleName, functionName, args)
  }

  public emitComponentEvent(tag: Tag, eventEmitRequestHandlerName: string, payload: any) {
    this.napiBridge.emitComponentEvent(this.id, tag, eventEmitRequestHandlerName, payload)
  }

  public emitDeviceEvent(eventName: string, params: any) {
    this.napiBridge.callRNFunction(this.id, "RCTDeviceEventEmitter", "emit", [eventName, params]);
  }

  public getBundleExecutionStatus(bundleURL: string): BundleExecutionStatus | undefined {
    return this.bundleExecutionStatusByBundleURL.get(bundleURL)
  }

  public async runJSBundle(jsBundleProvider: JSBundleProvider) {
    const bundleURL = jsBundleProvider.getURL()
    try {
      this.bundleExecutionStatusByBundleURL.set(bundleURL, "RUNNING")
      await this.napiBridge.loadScript(this.id, await jsBundleProvider.getBundle(), bundleURL)
      this.lifecycleState = LifecycleState.READY
      this.bundleExecutionStatusByBundleURL.set(bundleURL, "DONE")
      this.lifecycleEventEmitter.emit("JS_BUNDLE_EXECUTION_FINISH", {
        jsBundleUrl: bundleURL,
        appKeys: jsBundleProvider.getAppKeys()
      })
    } catch (err) {
      this.bundleExecutionStatusByBundleURL.delete(bundleURL)
      if (err instanceof JSBundleProviderError) {
        this.logger.error(err.message)
      } else if (err instanceof Error) {
        this.logger.error(err.message)
      }
      throw err
    }
  }

  public getTurboModule<T extends TurboModule>(name: string): T {
    return this.turboModuleProvider.getModule(name);
  }

  public createSurface(appKey: string): SurfaceHandle {
    const tag = this.getNextSurfaceTag();
    return new SurfaceHandle(this, tag, appKey, this.defaultProps, this.napiBridge);
  }

  public updateState(componentName: string, tag: Tag, state: unknown): void {
    this.napiBridge.updateState(this.id, componentName, tag, state)
  }

  public onBackPress() {
    this.emitDeviceEvent('hardwareBackPress', {})
  }

  public onForeground() {
    this.lifecycleState = LifecycleState.READY
    this.lifecycleEventEmitter.emit("FOREGROUND")
  }

  public onBackground() {
    this.lifecycleState = LifecycleState.PAUSED
    this.lifecycleEventEmitter.emit("BACKGROUND")

  }

  public onConfigurationUpdate(...args: Parameters<UIAbility["onConfigurationUpdate"]>) {
    this.lifecycleEventEmitter.emit("CONFIGURATION_UPDATE", ...args)
  }

  private getNextSurfaceTag(): Tag {
    // NOTE: this is done to mirror the iOS implementation.
    // For details, see `RCTAllocateRootViewTag` in iOS implementation.
    return (this.surfaceCounter++ * 10) + 1;
  }

  public shouldUIBeUpdated(): boolean {
    return this.lifecycleState === LifecycleState.READY
  }
}