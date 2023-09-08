import UIAbility from '@ohos.app.ability.UIAbility'
import common from '@ohos.app.ability.common'
import type { Tag } from './DescriptorBase'
import type { CommandDispatcher } from "./CommandDispatcher"
import type { DescriptorRegistry } from "./DescriptorRegistry"
import type { RNPackage } from "./RNPackage"
import type { TurboModule } from "./TurboModule"
import type { JSBundleProvider } from "./JSBundleProvider"
import { ComponentManagerRegistry } from './ComponentManagerRegistry'

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

export interface RNInstance {
  descriptorRegistry: DescriptorRegistry;
  commandDispatcher: CommandDispatcher;
  componentManagerRegistry: ComponentManagerRegistry;
  abilityContext: common.UIAbilityContext;

  getLifecycleState(): LifecycleState;

  getInitialProps(): Record<string, any>;

  subscribeToLifecycleEvents: <TEventName extends keyof LifecycleEventListenerByName>(
    eventName: TEventName,
    listener: LifecycleEventListenerByName[TEventName]
  ) => () => void;

  callRNFunction(moduleName: string, functionName: string, args: unknown[]): void;

  emitDeviceEvent(eventName: string, payload: any): void;

  emitComponentEvent(tag: Tag, eventEmitRequestHandlerName: string, payload: any): void;

  executeJS(jsBundleProvider: JSBundleProvider): Promise<void>;

  getTurboModule<T extends TurboModule>(name: string): T;

  startSurface(ctx: SurfaceContext);

  updateSurfaceConstraints(surfaceContext: SurfaceContext);

  updateState(componentName: string, tag: Tag, state: unknown): void;

  initialize(): void;

  getSurfaceOffset(): {
    x: number,
    y: number
  }

  getID(): number;
}

export type RNInstanceOptions = {
  initialProps: Record<string, any>,
  packages: RNPackage[]
}

export interface RNInstanceFactory {
  createInstance(options: RNInstanceOptions): RNInstance;
}