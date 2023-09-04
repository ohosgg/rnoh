import { TurboModuleProvider } from "./TurboModuleProvider";
import { Mutation } from "./Mutation";
import { Tag } from "./DescriptorBase";
import TextMeasurer from "@ohos.measure"


export class NapiBridge {
  constructor(private libRNOHApp: any) {
  }

  initializeReactNative(instanceId: number, turboModuleProvider: TurboModuleProvider) {
    this.libRNOHApp?.initializeReactNative(
      instanceId,
      turboModuleProvider,
      (config: { textContent: string }) => {
        // @ts-ignore px2vp is not properly declared on Ark side
        return { width: px2vp(TextMeasurer.measureText({ textContent: config.textContent })), height: 0 }
      });
  }

  emitComponentEvent(instanceId: number, tag: Tag, eventEmitRequestHandlerName: string, payload: any) {
    this.libRNOHApp?.emitComponentEvent(instanceId, tag, eventEmitRequestHandlerName, payload);
  }

  subscribeToShadowTreeChanges(
    instanceId: number,
    mutationsListener: (mutations: Mutation[]) => void,
    dispatchedCommandsListener: (tag: Tag, commandName: string, args: unknown) => void
  ) {
    this.libRNOHApp?.subscribeToShadowTreeChanges(instanceId, mutationsListener, dispatchedCommandsListener);
  }

  loadScriptFromString(instanceId: number, script: string, sourceURL = "bundle.harmony.js") {
    this.libRNOHApp?.loadScriptFromString(instanceId, script, sourceURL);
  }

  startSurface(
    instanceId: number,
    initialSurfaceWidth: number,
    initialSurfaceHeight: number,
    surfaceOffsetX: number,
    surfaceOffsetY: number,
    appName: string,
    initialProps: any) {
    this.libRNOHApp?.startSurface(
      instanceId,
      initialSurfaceWidth,
      initialSurfaceHeight,
      surfaceOffsetX,
      surfaceOffsetY,
      appName,
      initialProps,
    );
  }

  updateSurfaceConstraints(
    instanceId: number,
    appName: string,
    surfaceWidth: number,
    surfaceHeight: number,
    surfaceOffsetX: number,
    surfaceOffsetY: number,
  ) {
    this.libRNOHApp?.updateSurfaceConstraints(
      instanceId,
      appName,
      surfaceWidth,
      surfaceHeight,
      surfaceOffsetX,
      surfaceOffsetY
    );
  }

  callRNFunction(instanceId: number, moduleName: string, functionName: string, args: unknown[]): void {
    this.libRNOHApp?.callRNFunction(instanceId, moduleName, functionName, args);
  }

  onMemoryLevel(level: number): void {
    this.libRNOHApp?.onMemoryLevel(level)
  }

  updateState(instanceId: number, componentName: string, tag: Tag, state: unknown): void {
    this.libRNOHApp?.updateState(instanceId, componentName, tag, state)
  }
}
