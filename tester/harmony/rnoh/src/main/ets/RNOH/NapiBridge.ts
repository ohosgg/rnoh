import { TurboModuleProvider } from "./TurboModuleProvider";
import { Mutation } from "./Mutation";
import { Tag } from "./DescriptorBase";
import TextMeasurer from "@ohos.measure"


export class NapiBridge {
  constructor(private libRNOHApp: any) {
  }

  registerTurboModuleProvider(turboModuleProvider: TurboModuleProvider) {
    this.libRNOHApp?.registerTurboModuleProvider(turboModuleProvider);
  }

  initializeReactNative(screenDensity: number) {
    this.libRNOHApp?.initializeReactNative((config: { textContent: string }) => {
      return { width: TextMeasurer.measureText({ textContent: config.textContent }) / (screenDensity || 1), height: 0 }
    });
  }

  emitComponentEvent(tag: Tag, eventEmitRequestHandlerName: string, payload: any) {
    this.libRNOHApp?.emitComponentEvent(tag, eventEmitRequestHandlerName, payload);
  }

  subscribeToShadowTreeChanges(
    mutationsListener: (mutations: Mutation[]) => void,
    dispatchedCommandsListener: (tag: Tag, commandName: string, args: unknown) => void
  ) {
    this.libRNOHApp?.subscribeToShadowTreeChanges(mutationsListener, dispatchedCommandsListener);
  }

  loadScriptFromString(script: string, sourceURL = "bundle.harmony.js") {
    this.libRNOHApp?.loadScriptFromString(script, sourceURL);
  }

  run(initialSurfaceWidth: number, initialSurfaceHeight: number, appName: string, initialProps: any) {
    this.libRNOHApp?.startSurface(initialSurfaceWidth, initialSurfaceHeight, appName, initialProps);
  }

  updateSurfaceConstraints(appName: string, surfaceWidth: number, surfaceHeight: number) {
    this.libRNOHApp?.updateSurfaceConstraints(appName, surfaceWidth, surfaceHeight);
  }

  callRNFunction(moduleName: string, functionName: string, args: unknown[]): void {
    this.libRNOHApp?.callRNFunction(moduleName, functionName, args);
  }

  add(a: number, b: number): number {
    return this.libRNOHApp?.add(a, b)
  }

  onMemoryLevel(level: number): void {
    this.libRNOHApp?.onMemoryLevel(level)
  }
}
