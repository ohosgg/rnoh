import { TurboModule, TurboModuleContext } from "../../RNOH/TurboModule";
import { LifecycleState } from '../../RNOH/RNAbility';

export class AppStateTurboModule extends TurboModule {
  constructor(protected ctx: TurboModuleContext) {
    super(ctx);
    this.subscribeListeners();
  }

  private subscribeListeners() {
    this.ctx.rnInstanceManager.subscribeToLifecycleEvents("FOREGROUND", () => {
      this.ctx.rnInstanceManager.emitDeviceEvent("appStateDidChange", { app_state: this.getAppState() });
    })
    this.ctx.rnInstanceManager.subscribeToLifecycleEvents("BACKGROUND", () => {
      this.ctx.rnInstanceManager.emitDeviceEvent("appStateDidChange", { app_state: this.getAppState() });
    })
  }

  private getAppState() {
    return this.ctx.rnInstanceManager.getLifecycleState() === LifecycleState.READY
      ? "active" : "background"
  }

  getConstants() {
    return { initialAppState: this.getAppState() };
  }

  getCurrentAppState(success: (appState: { app_state: string }) => void, error: (error: Error) => void) {
    success({ app_state: this.getAppState() });
  };
}

