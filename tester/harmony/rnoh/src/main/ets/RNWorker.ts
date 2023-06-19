import worker, { ThreadWorkerGlobalScope, MessageEvents } from '@ohos.worker';
import libRNOHApp from 'librnoh_app.so'
import { RNPackageContext, RNPackage } from "./RNPackage"
import RNOHLogger from "./RNOHLogger"


export class RNWorker {
  static create(createPackages: (rnPackageCtx: RNPackageContext) => RNPackage[]) {
    const w = new RNWorker(worker.workerPort, createPackages({}));
    w.start()
    return w;
  }

  private syncIntervalId: any

  constructor(private workerPort: ThreadWorkerGlobalScope,
              private packages: RNPackage[]) {
  }

  start() {
    const x = libRNOHApp.add(1, 2)
    this.workerPort.onmessage = (message) => {
      if (message.data === "RNOH_SYNC_ACK") {
        RNOHLogger.info(`Worker received: ${message.data}`)
        clearInterval(this.syncIntervalId)
      }
    };
    libRNOHApp.registerWorker()
    this.syncIntervalId = setInterval(() => {
      RNOHLogger.info(`Worker dispatches event: RNOH_SYNC`)
      this.workerPort.postMessage("RNOH_SYNC")
    }, 100)
  }
}