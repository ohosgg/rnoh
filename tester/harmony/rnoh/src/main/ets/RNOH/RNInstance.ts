import UIAbility from '@ohos.app.ability.UIAbility'
import common from '@ohos.app.ability.common'
import type { Tag } from './DescriptorBase'
import type { CommandDispatcher } from "./CommandDispatcher"
import type { DescriptorRegistry } from "./DescriptorRegistry"
import type { RNPackage, RNPackageContext } from "./RNPackage"
import type { TurboModule } from "./TurboModule"
import type { JSBundleProvider } from "./JSBundleProvider"
import { ComponentManagerRegistry } from './ComponentManagerRegistry'

export type SurfaceContext = {
  appKey: string
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

export type BundleExecutionStatus = "RUNNING" | "DONE"

export interface RNInstance {
  descriptorRegistry: DescriptorRegistry;
  commandDispatcher: CommandDispatcher;
  componentManagerRegistry: ComponentManagerRegistry;
  abilityContext: common.UIAbilityContext;

  getLifecycleState(): LifecycleState;

  subscribeToLifecycleEvents: <TEventName extends keyof LifecycleEventListenerByName>(
    eventName: TEventName,
    listener: LifecycleEventListenerByName[TEventName]
  ) => () => void;

  callRNFunction(moduleName: string, functionName: string, args: unknown[]): void;

  emitDeviceEvent(eventName: string, payload: any): void;

  emitComponentEvent(tag: Tag, eventEmitRequestHandlerName: string, payload: any): void;

  getBundleExecutionStatus(bundleURL: string): BundleExecutionStatus | undefined

  runJSBundle(jsBundleProvider: JSBundleProvider): Promise<void>;

  getTurboModule<T extends TurboModule>(name: string): T;

  createSurface(moduleName: string): Tag;

  startSurface(tag: Tag, surfaceContext: SurfaceContext, initialProps: Record<string, any>): void;

  updateSurfaceConstraints(tag: Tag, surfaceContext: SurfaceContext): void;

  stopSurface(tag: Tag): void;

  destroySurface(tag: Tag): void;

  updateState(componentName: string, tag: Tag, state: unknown): void;

  initialize(): void;

  getId(): number;
}

export type RNInstanceOptions = {
  createRNPackages: (ctx: RNPackageContext) => RNPackage[]
}