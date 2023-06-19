import { TurboModuleProvider } from "./TurboModuleProvider";
import { TurboModule } from "./TurboModule";
import { Mutation } from "./mutations";
import { Tag } from "./descriptor";
import TextMeasurer from "@ohos.measure"

/**
 * Object stereotype: Interfacer
 *
 * Communication with CPP side flows via this class. If you are a package developer, please use `RNInstanceManager` instead.
 */
export class RNInstance {
  private turboModuleProvider: TurboModuleProvider | null = null

  constructor(private libRNOHApp: any) {}

  setTurboModuleProvider(turboModuleProvider: TurboModuleProvider) {
    this.turboModuleProvider = turboModuleProvider
  }

  getTurboModule<T extends TurboModule>(name: string): T {
    return this.turboModuleProvider?.getModule<T>(name);
  }

  registerTurboModuleProvider() {
    this.libRNOHApp?.registerTurboModuleProvider(this.turboModuleProvider);
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

  callRNFunction(moduleName: string, functionName: string, args: unknown[]): void {
    this.libRNOHApp?.callRNFunction(moduleName, functionName, args);
  }

  add(a: number, b: number): number {
    return this.libRNOHApp?.add(a, b)
  }
}

