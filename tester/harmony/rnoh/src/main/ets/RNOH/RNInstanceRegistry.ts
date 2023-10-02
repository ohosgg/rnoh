import common from '@ohos.app.ability.common';
import UIAbility from '@ohos.app.ability.UIAbility'
import { CommandDispatcher, RNInstance } from '.';
import { DescriptorRegistry } from './DescriptorRegistry'
import { RNOHCorePackage } from '../RNOHCorePackage/Package';
import { Tag } from './DescriptorBase';
import { NapiBridge } from './NapiBridge';
import { LifecycleState, LifecycleEventArgsByEventName, BundleExecutionStatus } from './RNInstance';
import { RNOHContext } from './RNOHContext';
import { RNOHLogger } from './RNOHLogger';
import { RNPackage, RNPackageContext } from './RNPackage';
import { TurboModule } from './TurboModule';
import { TurboModuleProvider } from './TurboModuleProvider';
import { JSBundleProvider, JSBundleProviderError } from "./JSBundleProvider"
import { ComponentManagerRegistry } from './ComponentManagerRegistry';
import { SurfaceHandle } from './SurfaceHandle';
import { EventEmitter } from './EventEmitter'

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

export class RNInstanceRegistry {
  private nextInstanceId = 0;
  private instanceMap: Map<number, RNInstanceManagerImpl> = new Map();

  constructor(
    private logger: RNOHLogger,
    private napiBridge: NapiBridge,
    private abilityContext: common.UIAbilityContext) {
  }

  public createInstance(
    options: {
      createRNPackages: (ctx: RNPackageContext) => RNPackage[]
    }
  ): RNInstance {
    const id = this.nextInstanceId++;

    const instance = new RNInstanceManagerImpl(
      id,
      this.logger,
      options.createRNPackages({}),
      this.abilityContext,
      this.napiBridge,
      this.getDefaultProps()
    )
    instance.initialize()
    this.instanceMap.set(id, instance)
    return instance;
  }

  public getInstance(id: number): RNInstance {
    return this.instanceMap.get(id);
  }

  public deleteInstance(id: number): boolean {
    if (this.instanceMap.has(id)) {
      this.instanceMap.delete(id);
      return true;
    }
    return false;
  }

  public forEach(cb: (rnInstance: RNInstanceManagerImpl) => void) {
    this.instanceMap.forEach(cb)
  }

  private getDefaultProps(): Record<string, any> {
    return { concurrentRoot: true }
  }
}

export class RNInstanceManagerImpl implements RNInstance {
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
    packages: RNPackage[],
    public abilityContext: common.UIAbilityContext,
    private napiBridge: NapiBridge,
    private defaultProps: Record<string, any>) {
    this.componentManagerRegistry = new ComponentManagerRegistry();
    this.descriptorRegistry = new DescriptorRegistry(
      {
        '1': { ...rootDescriptor },
      },
      this.updateState.bind(this),
      this
    );
    this.commandDispatcher = new CommandDispatcher();
    this.turboModuleProvider = this.processPackages(packages).turboModuleProvider
  }

  public getId(): number {
    return this.id;
  }

  public initialize() {
    this.napiBridge.initializeReactNative(this.id, this.turboModuleProvider)
    this.napiBridge.subscribeToShadowTreeChanges(this.id, (mutations) => {
      this.descriptorRegistry.applyMutations(mutations)
    }, (tag, commandName, args) => {
      this.commandDispatcher.dispatchCommand(tag, commandName, args)
    })
  }

  private processPackages(packages: RNPackage[]) {
    packages.unshift(new RNOHCorePackage({}));
    const turboModuleContext = new RNOHContext("0.0.0", this, this.logger)
    return {
      turboModuleProvider: new TurboModuleProvider(packages.map((pkg) => {
        return pkg.createTurboModulesFactory(turboModuleContext);
      }))
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