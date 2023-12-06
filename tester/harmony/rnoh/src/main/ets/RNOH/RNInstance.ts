import type UIAbility from '@ohos.app.ability.UIAbility'
import type common from '@ohos.app.ability.common'
import { CommandDispatcher, RNComponentCommandHub } from './RNComponentCommandHub'
import { DescriptorRegistry } from './DescriptorRegistry'
import { ComponentManagerRegistry } from './ComponentManagerRegistry'
import { SurfaceHandle } from './SurfaceHandle'
import { TurboModuleProvider } from './TurboModuleProvider'
import { EventEmitter } from './EventEmitter'
import type { RNOHLogger } from './RNOHLogger'
import type { NapiBridge } from './NapiBridge'
import type { RNOHContext } from './RNOHContext'
import { RNOHCorePackage } from '../RNOHCorePackage/ts'
import type { JSBundleProvider } from './JSBundleProvider'
import { JSBundleProviderError } from './JSBundleProvider'
import type { NativeId, Tag } from './DescriptorBase'
import type { RNPackage, RNPackageContext } from './RNPackage'
import type { TurboModule } from './TurboModule'

export type SurfaceContext = {
  width: number
  height: number
  surfaceOffsetX: number
  surfaceOffsetY: number
  pixelRatio: number
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
  props: {},
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

  /**
   * @deprecated Use RNOHContext::componentCommandReceiver
   */
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

  bindComponentNameToDescriptorType(componentName: string, descriptorType: string);

  getComponentNameFromDescriptorType(descriptorType: string): string
}

/**
 * @deprecated Use `RNInstance` instead.
 */
export type RNInstanceManager = RNInstance

export type RNInstanceOptions = {
  createRNPackages: (ctx: RNPackageContext) => RNPackage[]
}

export enum RNOHComponentCommand {
  BLOCK_NATIVE_RESPONDER = "RNOH::BLOCK_NATIVE_RESPONDER",
  UNBLOCK_NATIVE_RESPONDER = "RNOH::UNBLOCK_NATIVE_RESPONDER",
}

export class RNInstanceImpl implements RNInstance {
  private turboModuleProvider: TurboModuleProvider
  private surfaceCounter = 0;
  private lifecycleState: LifecycleState = LifecycleState.BEFORE_CREATE
  private bundleExecutionStatusByBundleURL: Map<string, BundleExecutionStatus> = new Map()
  public descriptorRegistry: DescriptorRegistry;
  public componentCommandHub: RNComponentCommandHub;
  public componentManagerRegistry: ComponentManagerRegistry;
  private lifecycleEventEmitter = new EventEmitter<LifecycleEventArgsByEventName>()
  private componentNameByDescriptorType = new Map<string, string>()
  private logger: RNOHLogger

  /**
   * @deprecated
   */
  public get commandDispatcher() {
    return this.componentCommandHub
  }

  constructor(
    private id: number,
    logger: RNOHLogger,
    public abilityContext: common.UIAbilityContext,
    private napiBridge: NapiBridge,
    private defaultProps: Record<string, any>,
    private createRNOHContext: (rnInstance: RNInstance) => RNOHContext
  ) {
    this.logger = logger.clone("RNInstance")
    const stopTracing = this.logger.clone("constructor").startTracing()
    this.componentManagerRegistry = new ComponentManagerRegistry();
    this.descriptorRegistry = new DescriptorRegistry(
      {
        '1': { ...rootDescriptor },
      },
      this.updateState.bind(this),
      this,
      logger,
    );
    this.componentCommandHub = new RNComponentCommandHub();
    stopTracing()
  }

  public onDestroy() {
    this.turboModuleProvider.onDestroy()
  }

  public getId(): number {
    return this.id;
  }

  public async initialize(packages: RNPackage[]) {
    const stopTracing = this.logger.clone("initialize").startTracing()
    this.turboModuleProvider = (await this.processPackages(packages)).turboModuleProvider
    this.napiBridge.createReactNativeInstance(
      this.id,
      this.turboModuleProvider,
      (mutations) => {
        this.descriptorRegistry.applyMutations(mutations)
      },
      (tag, commandName, args) => {
        this.componentCommandHub.dispatchCommand(tag, commandName, args)
      },
      (type, payload) => {
        this.onCppMessage(type, payload)
      }
    )
    stopTracing()
  }

  private onCppMessage(type: string, payload: any) {
    switch (type) {
      case "SCHEDULER_DID_SET_IS_JS_RESPONDER": {
        if (payload.blockNativeResponder) {
          this.onBlockNativeResponder(payload.tag)
        } else {
          this.onUnblockNativeResponder(payload.tag)
        }
        break;
      }
      default:
        this.logger.error(`Unknown action: ${type}`)
    }
  }

  private onBlockNativeResponder(tag: Tag) {
    const stopTracing = this.logger.clone("onBlockNativeResponder").startTracing()
    const tags = this.descriptorRegistry.getDescriptorLineage(tag).map(d => d.tag)
    tags.forEach((tag) => {
      this.componentCommandHub.dispatchCommand(tag, RNOHComponentCommand.BLOCK_NATIVE_RESPONDER, undefined)
    })
    stopTracing()
  }

  private onUnblockNativeResponder(tag: Tag) {
    const stopTracing = this.logger.clone("onUnblockNativeResponder").startTracing()
    const tags = this.descriptorRegistry.getDescriptorLineage(tag).map(d => d.tag)
    tags.forEach((tag) => {
      this.componentCommandHub.dispatchCommand(tag, RNOHComponentCommand.UNBLOCK_NATIVE_RESPONDER, undefined)
    })
    stopTracing()
  }

  private async processPackages(packages: RNPackage[]) {
    const logger = this.logger.clone("processPackages")
    const stopTracing = logger.startTracing()
    packages.unshift(new RNOHCorePackage({}));
    const turboModuleContext = this.createRNOHContext(this)
    const result = {
      turboModuleProvider: new TurboModuleProvider(
        await Promise.all(packages.map(async (pkg, idx) => {
          const pkgDebugName = pkg.getDebugName()
          let traceName = `package${idx + 1}`
          if (pkgDebugName) {
            traceName += `: ${pkgDebugName}`
          }
          logger.clone(traceName).debug("")
          const turboModuleFactory = pkg.createTurboModulesFactory(turboModuleContext);
          await turboModuleFactory.prepareEagerTurboModules()
          return turboModuleFactory
        }))
      )
    }
    stopTracing()
    return result
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
    const stopTracing = this.logger.clone(`emitDeviceEvent (eventName: ${eventName})`).startTracing()
    this.napiBridge.callRNFunction(this.id, "RCTDeviceEventEmitter", "emit", [eventName, params]);
    stopTracing()
  }

  public getBundleExecutionStatus(bundleURL: string): BundleExecutionStatus | undefined {
    return this.bundleExecutionStatusByBundleURL.get(bundleURL)
  }

  public async runJSBundle(jsBundleProvider: JSBundleProvider) {
    const stopTracing = this.logger.clone("runJSBundle").startTracing()
    const bundleURL = jsBundleProvider.getURL()
    try {
      this.bundleExecutionStatusByBundleURL.set(bundleURL, "RUNNING")
      const jsBundle = await jsBundleProvider.getBundle()
      await this.napiBridge.loadScript(this.id, jsBundle, bundleURL)
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
    } finally {
      stopTracing()
    }
  }

  public getTurboModule<T extends TurboModule>(name: string): T {
    return this.turboModuleProvider.getModule(name);
  }

  public createSurface(appKey: string): SurfaceHandle {
    const stopTracing = this.logger.clone("createSurface").startTracing()
    const tag = this.getNextSurfaceTag();
    const result = new SurfaceHandle(this, tag, appKey, this.defaultProps, this.napiBridge);
    stopTracing()
    return result
  }

  public updateState(componentName: string, tag: Tag, state: unknown): void {
    const stopTracing = this.logger.clone("updateState").startTracing()
    this.napiBridge.updateState(this.id, componentName, tag, state)
    stopTracing()
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

  public bindComponentNameToDescriptorType(componentName: string, descriptorType: string): void {
    this.componentNameByDescriptorType.set(descriptorType, componentName)
  }

  public getComponentNameFromDescriptorType(descriptorType: string): string {
    if (this.componentNameByDescriptorType.has(descriptorType)) {
      return this.componentNameByDescriptorType.get(descriptorType)!
    }
    return descriptorType
  }
}

