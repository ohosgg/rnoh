import webSocket from '@ohos.net.webSocket';
import { DevMenuTurboModule } from '../RNOHCorePackage/turboModules';
import { RNOHLogger } from './RNOHLogger';
import { RNInstance } from './ts';

export interface JSPackagerClientConfig {
  host: string,
  port: number | string,
}

export class JSPackagerClient {
  private webSocket: webSocket.WebSocket;
  private logger: RNOHLogger;
  private rnInstance: RNInstance;

  constructor(logger: RNOHLogger, rnInstance: RNInstance) {
    this.logger = logger;
    this.rnInstance = rnInstance;
  }

  public connectToMetroMessages(config: JSPackagerClientConfig) {
    this.webSocket = webSocket.createWebSocket();
    const url = this.buildUrl(config);
    this.webSocket.on("message", (err, data) => {
      if (err) {
        this.logger.error("JSPackagerClient websocket error " + err.message);
        return;
      }
      if (typeof data === "string") {
        const message = JSON.parse(data);
        if (message.method === "devMenu") {
          const devMenuTurboModule = this.rnInstance.getTurboModule<DevMenuTurboModule>("DevMenu");
          devMenuTurboModule.show();
        }
      }
    })
    this.webSocket.connect(url, (err, _data) => {
      if (!err) {
        this.logger.info("JSPackagerClient websocket connected successfully");
      } else {
        this.logger.error("JSPackagerClient websocket connection failed, err: " + JSON.stringify(err));
      }
    });
  }

  public disconnect() {
    this.webSocket.close();
  }

  private buildUrl(config: JSPackagerClientConfig): string {
    return `ws://${config.host}:${config.port}/message`;
  }
}