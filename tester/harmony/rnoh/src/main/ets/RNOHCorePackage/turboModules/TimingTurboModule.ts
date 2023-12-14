import { LifecycleState, TurboModule } from '../../RNOH/ts';

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
      if (this.ctx.rnInstance.getLifecycleState() === LifecycleState.READY) {
        this.ctx.rnInstance.callRNFunction("JSTimers", "callTimers", [[id]]);
        if (!repeats) {
          this.deleteTimer(id);
        }
      }
      else if (this.ctx.rnInstance.getLifecycleState() === LifecycleState.PAUSED) {
        this.deleteTimer(id);
        this.ctx.rnInstance.subscribeToLifecycleEvents("FOREGROUND", () => {
          this.ctx.rnInstance.callRNFunction("JSTimers", "callTimers", [[id]]);
          if (repeats) {
            const nativeTimerId = setInterval(triggerTimer, duration);
            this.nativeTimerMap.set(id, { nativeTimerId, repeats });
          }
        })
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