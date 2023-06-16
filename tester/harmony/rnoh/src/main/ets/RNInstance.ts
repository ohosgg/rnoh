import { TurboModuleProvider } from "./TurboModuleProvider";
import { TurboModule } from "./TurboModule";
import { Mutation } from "./mutations";
import { Tag } from "./descriptor";
import TextMeasurer from "@ohos.measure"

/**
 * Object stereotype: Interfacer
 *
 * All communication with CPP side flows via methods of this class. If you are a package developer,
 * please use `RNInstanceManager` if possible, as it provides more stable interface.
 */
export class RNInstance {
  private libRNOHApp: any;
  private turboModuleProvider: TurboModuleProvider | null = null

  setTurboModuleProvider(turboModuleProvider: TurboModuleProvider) {
    this.turboModuleProvider = turboModuleProvider
  }

  setLibRNOHApp(libRNOHApp: unknown) {
    if (this.libRNOHApp) {
      throw new Error("libRNOHApp has been already set");
    }
    this.libRNOHApp = libRNOHApp;
  }

  getTurboModule<T extends TurboModule>(name: string): T {
    return this.turboModuleProvider.getModule<T>(name);
  }

  registerTurboModuleProvider() {
    this.libRNOHApp.registerTurboModuleProvider(this.turboModuleProvider);
  }

  initializeReactNative() {
    this.libRNOHApp.initializeReactNative((config: { textContent: string }) => {
      return { width: TextMeasurer.measureText({ textContent: config.textContent }), height: 0 }
    });
  }

  emitComponentEvent(tag: Tag, eventEmitRequestHandlerName: string, payload: any) {
    this.libRNOHApp.emitComponentEvent(tag, eventEmitRequestHandlerName, payload);
  }

  subscribeToShadowTreeChanges(
    mutationsListener: (mutations: Mutation[]) => void,
    dispatchedCommandsListener: (tag: Tag, commandName: string, args: unknown) => void
  ) {
    this.libRNOHApp.subscribeToShadowTreeChanges(mutationsListener, dispatchedCommandsListener);
  }

  loadScriptFromString(script: string, sourceURL = "bundle.harmony.js") {
    this.libRNOHApp.loadScriptFromString(script, sourceURL);
  }

  run(initialSurfaceWidth: number, initialSurfaceHeight: number, appName: string, initialProps: any) {
    this.libRNOHApp.startSurface(initialSurfaceWidth, initialSurfaceHeight, appName, initialProps);
  }

  callRNFunction(moduleName: string, functionName: string, args: unknown[]): void {
    this.libRNOHApp.callRNFunction(moduleName, functionName, args);
  }
}

