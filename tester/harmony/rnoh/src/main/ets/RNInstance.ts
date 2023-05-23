import { RNPackage, RNPackageContext } from "./RNPackage";
import { RNOHCorePackage } from "./RNOHCorePackage";
import { TurboModuleProvider } from "./TurboModuleProvider";
import { TurboModule } from "./TurboModule";
import { Mutation } from "./mutations";
import { Tag } from "./descriptor";

export class RNInstance {
  private packages: RNPackage[];
  private ctx: RNPackageContext = { reactNativeVersion: "0.0.0", rnInstance: this };
  private turboModuleProvider: TurboModuleProvider;
  private libRNOHApp: any;

  constructor(private bundleUrl: string, private appName: string, createPackages: (ctx: RNPackageContext) => RNPackage[]) {
    this.packages = createPackages(this.ctx);
    this.packages.unshift(new RNOHCorePackage(this.ctx));
    this.turboModuleProvider = new TurboModuleProvider(this.packages.map((pkg) => {
      return pkg.createTurboModulesFactory(this.ctx);
    }));
  }

  getBundleUrl(): string {
    return this.bundleUrl;
  }
  getAppName(): string {
    return this.appName;
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
    this.libRNOHApp.initializeReactNative(this.appName);
  }

  emitEvent(tag: Tag, eventKind: number, event: any) {
    this.libRNOHApp.emitEvent(tag, eventKind, event);
  }

  subscribeToShadowTreeChanges(
    mutationsListener: (mutations: Mutation[]) => void,
    dispatchedCommandsListener: (tag: Tag, commandName: string, args: unknown) => void
  ) {
    this.libRNOHApp.subscribeToShadowTreeChanges(mutationsListener, dispatchedCommandsListener);
  }

  run(initialSurfaceWidth: number, initialSurfaceHeight: number, jsBundle: string) {
    this.libRNOHApp.startReactNative(initialSurfaceWidth, initialSurfaceHeight, jsBundle);
  }

  callRNFunction(moduleName: string, functionName: string, args: unknown[]): void {
    this.libRNOHApp.callRNFunction(moduleName, functionName, args);
  }
}