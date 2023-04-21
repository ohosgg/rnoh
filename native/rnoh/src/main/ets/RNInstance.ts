import { RNPackage, RNPackageContext } from "./RNPackage";
import { RNOHCorePackage } from "./RNOHCorePackage";
import { TurboModuleProvider } from "./TurboModuleProvider";
import { TurboModule } from "./TurboModule";
import { Mutation } from "./mutations";
import { Tag } from "./descriptor";

export class RNInstance {
  private packages: RNPackage[];
  private ctx: RNPackageContext = { reactNativeVersion: "0.0.0" };
  private turboModuleProvider: TurboModuleProvider;
  private rnAppNapiBridge: any;

  constructor(createPackages: (ctx: RNPackageContext) => RNPackage[]) {
    this.packages = createPackages(this.ctx);
    this.packages.unshift(new RNOHCorePackage(this.ctx));
    this.turboModuleProvider = new TurboModuleProvider(this.packages.map((pkg) => {
      return pkg.createTurboModulesFactory(this.ctx);
    }));
  }

  setRNOHAppNapiBridge(rnAppNapiBridge: unknown) {
    if (this.rnAppNapiBridge) {
      throw new Error("rnAppNapiBridge has been already set");
    }
    this.rnAppNapiBridge = rnAppNapiBridge;
  }

  getTurboModule<T extends TurboModule>(name: string): T {
    return this.turboModuleProvider.getModule<T>(name);
  }

  registerTurboModuleProvider() {
    this.rnAppNapiBridge.registerTurboModuleProvider(this.turboModuleProvider);
  }

  initializeReactNative() {
    this.rnAppNapiBridge.initializeReactNative();
  }

  emitEvent(tag: Tag, eventKind: number, event: any) {
    this.rnAppNapiBridge.emitEvent(tag, eventKind, event);
  }

  subscribeToShadowTreeChanges(
    mutationsListener: (mutations: Mutation[]) => void,
    dispatchedCommandsListener: (tag: Tag, commandName: string, args: unknown) => void
  ) {
    this.rnAppNapiBridge.subscribeToShadowTreeChanges(mutationsListener, dispatchedCommandsListener);
  }

  run(initialSurfaceWidth: number, initialSurfaceHeight: number) {
    this.rnAppNapiBridge.startReactNative(initialSurfaceWidth, initialSurfaceHeight);
  }
}