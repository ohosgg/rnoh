import { EventEmittingTurboModule, TurboModuleContext } from "../../TurboModule";
import { LifecycleState } from '../../RNAbility';

const APP_STATE_EVENT_NAMES = ["appStateDidChange"] as const

export class AppStateTurboModule extends EventEmittingTurboModule<typeof APP_STATE_EVENT_NAMES[number]> {
  constructor(protected ctx: TurboModuleContext) {
    super(ctx);
    this.subscribeListeners();
  }

  private subscribeListeners() {
    this.ctx.rnInstanceManager.subscribeToLifecycleEvents("FOREGROUND", () => {
      this.sendEvent("appStateDidChange", { app_state: this.getAppState() });
    })
    this.ctx.rnInstanceManager.subscribeToLifecycleEvents("BACKGROUND", () => {
      this.sendEvent("appStateDidChange", { app_state: this.getAppState() });
    })
  }

  private getAppState() {
    return this.ctx.rnInstanceManager.getLifecycleState() === LifecycleState.READY
      ? "active" : "background"
  }

  protected getSupportedEvents() {
    return APP_STATE_EVENT_NAMES;
  }

  getConstants() {
    return { initialAppState: this.getAppState() };
  }

  getCurrentAppState(success: (appState: { app_state: string }) => void, error: (error: Error) => void) {
    success({ app_state: this.getAppState() });
  };
}

