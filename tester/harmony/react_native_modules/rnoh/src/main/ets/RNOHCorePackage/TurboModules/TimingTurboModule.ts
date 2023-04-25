import { TurboModule } from "../../TurboModule";

export class TimingTurboModule extends TurboModule {
    private nativeTimerMap: Map<number, { nativeTimerId: number, repeats: boolean }> = new Map();

    createTimer(
        id: number,
        duration: number,
        jsSchedulingTime: number,
        repeats: boolean
    ): void {
        console.log(`RNOH TimingTurboModule::createTimer(${id}, ${duration}, ${jsSchedulingTime}, ${repeats})`);

        const triggerTimer = () =>
            this.ctx.rnInstance.callRNFunction("JSTimers", "callTimers", [[id]]);

        let nativeTimerId: number;

        if (repeats) {
            nativeTimerId = setInterval(triggerTimer, duration)
        } else {
            nativeTimerId = setTimeout(triggerTimer, duration)
        }

        this.nativeTimerMap.set(id, { nativeTimerId, repeats });
    }

    deleteTimer(id: number): void {
        console.log(`RNOH TimingTurboModule::deleteTimer(${id})`);

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
        console.warn(`RNOH TimingTurboModule::setSendIdleEvents(${enabled}): not implemented`);
    }
}