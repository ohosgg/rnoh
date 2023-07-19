import { TurboModule } from "../../RNOH/TurboModule";

export class TimingTurboModule extends TurboModule {
  public static readonly NAME = 'Timing';

  private nativeTimerMap: Map<number, {
    nativeTimerId: number,
    repeats: boolean
  }> = new Map();

  createTimer(
    id: number,
    duration: number,
    jsSchedulingTime: number,
    repeats: boolean
  ): void {
    const triggerTimer = () => {
      this.ctx.__napiBridge.callRNFunction("JSTimers", "callTimers", [[id]]);
      if (!repeats) {
        this.deleteTimer(id);
      }
    };

    let nativeTimerId;

    if (repeats) {
      nativeTimerId = setInterval(triggerTimer, duration)
    } else {
      const delay = new Date().getTime() - jsSchedulingTime;
      nativeTimerId = setTimeout(triggerTimer, Math.max(0, duration - delay))
    }

    this.nativeTimerMap.set(id, { nativeTimerId, repeats });
  }

  deleteTimer(id: number): void {
    const timer = this.nativeTimerMap.get(id);
    if (!timer) {
      return;
    }

    const { nativeTimerId, repeats } = timer;

    if (repeats) {
      clearInterval(nativeTimerId);
    } else {
      clearTimeout(nativeTimerId);
    }
  }

  setSendIdleEvents(enabled: boolean): void {
    this.ctx.logger.warn(`TimingTurboModule::setSendIdleEvents(${enabled}): not implemented`);
  }
}