import { LifecycleState } from '../../RNOH';
import { TurboModule, TurboModuleContext } from "../../RNOH/TurboModule";

export class AppStateTurboModule extends TurboModule {
  public static readonly NAME = 'AppState';

  constructor(protected ctx: TurboModuleContext) {
    super(ctx);
    this.subscribeListeners();
  }

  private subscribeListeners() {
    this.ctx.rnInstance.subscribeToLifecycleEvents("FOREGROUND", () => {
      this.ctx.rnInstance.emitDeviceEvent("appStateDidChange", { app_state: this.getAppState() });
    })
    this.ctx.rnInstance.subscribeToLifecycleEvents("BACKGROUND", () => {
      this.ctx.rnInstance.emitDeviceEvent("appStateDidChange", { app_state: this.getAppState() });
    })
  }

  private getAppState() {
    return this.ctx.rnInstance.getLifecycleState() === LifecycleState.READY
      ? "active" : "background"
  }

  getConstants() {
    return { initialAppState: this.getAppState() };
  }

  getCurrentAppState(success: (appState: { app_state: string }) => void, error: (error: Error) => void) {
    success({ app_state: this.getAppState() });
  };
}

