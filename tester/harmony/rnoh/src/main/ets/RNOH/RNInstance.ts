import UIAbility from '@ohos.app.ability.UIAbility'
import common from '@ohos.app.ability.common'
import { CommandDispatcher, DescriptorRegistry, RNPackage, Tag, TurboModule } from './'

export type SurfaceContext = {
  appName: string
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

export interface LifecycleEventListenerByName {
  CONFIGURATION_UPDATE: (...args: Parameters<UIAbility["onConfigurationUpdate"]>) => void;
  FOREGROUND: () => void;
  BACKGROUND: () => void;
}

export type RNInstanceOptions = {
  bundleUrl: string,
  initialProps: Record<string, any>,
  packages: RNPackage[]
}

export interface RNInstance {
  descriptorRegistry: DescriptorRegistry;
  commandDispatcher: CommandDispatcher;
  abilityContext: common.UIAbilityContext;

  getLifecycleState(): LifecycleState;

  getBundleURL(): string;

  getInitialProps(): Record<string, any>;

  subscribeToLifecycleEvents: <TEventName extends keyof LifecycleEventListenerByName>(
    eventName: TEventName,
    listener: LifecycleEventListenerByName[TEventName]
  ) => () => void;

  callRNFunction(moduleName: string, functionName: string, args: unknown[]): void;

  emitDeviceEvent(eventName: string, payload: any): void;

  emitComponentEvent(tag: Tag, eventEmitRequestHandlerName: string, payload: any): void;

  loadScriptFromString(script: string, sourceURL?: string);

  getTurboModule<T extends TurboModule>(name: string): T;

  startSurface(ctx: SurfaceContext);

  updateSurfaceConstraints(surfaceContext: SurfaceContext);

  updateState(componentName: string, tag: Tag, state: unknown): void;

  initialize(): void;

  getSurfaceOffset(): {
    x: number,
    y: number
  }
}

export interface RNInstanceFactory {
  createInstance(options: RNInstanceOptions): RNInstance
}