import { EventEmittingTurboModule, TurboModuleContext } from "../../TurboModule";
import RNOHLogger from "../../RNOHLogger"
import { RNAbility, LifecycleState } from '../../RNAbility';


type AppStateCallback = (appState: { app_state: string }) => void;
type ErrorCallback = (error: Error) => void;

export class AppStateTurboModule extends EventEmittingTurboModule {
  private static readonly APP_STATE_CHANGE_EVENT = "appStateDidChange";
  private static readonly APP_STATE_ACTIVE = "active";
  private static readonly APP_STATE_BACKGROUND = "background";

  supportedEvents: string[] = [AppStateTurboModule.APP_STATE_CHANGE_EVENT];

  private appState: string

  constructor(ctx: TurboModuleContext) {
    super(ctx);
    this.appState = this.ctx.rnInstanceManager.getLifecycleState() === LifecycleState.READY
      ? AppStateTurboModule.APP_STATE_ACTIVE : AppStateTurboModule.APP_STATE_BACKGROUND
    this.subscribeListeners()
  }

  private subscribeListeners() {
    this.ctx.rnInstanceManager.subscribeToLifecycleEvents("FOREGROUND", () => {
      this.setAppStateActive()
    })
    this.ctx.rnInstanceManager.subscribeToLifecycleEvents("BACKGROUND", () => {
      this.setAppStateBackground()
    })
  }

  setAppStateActive() {
    this.appState = AppStateTurboModule.APP_STATE_ACTIVE;
    this.sendEvent(AppStateTurboModule.APP_STATE_CHANGE_EVENT, {
      app_state: this.appState,
    });
  }

  setAppStateBackground() {
    this.appState = AppStateTurboModule.APP_STATE_BACKGROUND;
    this.sendEvent(AppStateTurboModule.APP_STATE_CHANGE_EVENT, {
      app_state: this.appState,
    });
  }

  getConstants() {
    if (!this.appState) {
      RNOHLogger.error("AppState not set");
    }
    return {
      initialAppState: this.appState,
    };
  }

  getCurrentAppState(success: AppStateCallback, error: ErrorCallback) {
    success({ app_state: this.appState });
  };
}

