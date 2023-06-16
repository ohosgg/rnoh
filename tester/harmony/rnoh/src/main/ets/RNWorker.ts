import worker, {ThreadWorkerGlobalScope, MessageEvents} from '@ohos.worker';

export class RNWorker {
  static create() {
    const w = new RNWorker(worker.workerPort);
    w.start()
    return w;
  }

  constructor(private workerPort: ThreadWorkerGlobalScope) {}

  start() {
    this.workerPort.onmessage = (message: MessageEvents) => {
      this.onMessage(message.data);
    };
    this.workerPort.dispatchEvent({
      type: 'READY',
      timeStamp: new Date().getDate(),
    });
  }

  onMessage(data: any) {}
}
