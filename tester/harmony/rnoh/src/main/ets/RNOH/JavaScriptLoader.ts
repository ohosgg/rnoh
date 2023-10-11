import http from '@ohos.net.http';
import util from '@ohos.util';
import type resmgr from "@ohos.resourceManager";

import type { RNOHLogger } from './RNOHLogger'

export default class JavaScriptLoader {
  constructor(private resourceManager: resmgr.ResourceManager, private logger: RNOHLogger) {
  }
  
  public async loadBundle(uriString: string): Promise<string> {
    if (uriString.startsWith("http")) {
      return this.loadFromNetwork(uriString);
    } else {
      return this.loadFromFile(uriString);
    }
  }

  async loadFromFile(bundlePath: string): Promise<string> {
    try {
      const bundleFileContent = await this.resourceManager.getRawFileContent(bundlePath);
      const bundle = util.TextDecoder.create("utf-8").decodeWithStream(bundleFileContent);
      return bundle;
    } catch (err) {
      this.logger.fatal("Failed to load local bundle: " + bundlePath);
      throw err;
    }
  }

  async loadFromNetwork(uriString: string): Promise<string> {
    const httpRequest = http.createHttp();
    try {
      this.logger.info('loading bundle ' + uriString)
      const data = await httpRequest.request(
        uriString,
        {
          header: {
            'Content-Type': 'text/javascript'
          },
        }
      );
      this.logger.info('code:' + data.responseCode);
      this.logger.info('header:' + JSON.stringify(data.header));
      this.logger.info('cookies:' + data.cookies);
      return data.result as string;
    } catch (err) {
      this.logger.error('Bundle load error: ' + JSON.stringify(err));
      throw err;
    } finally {
      httpRequest.destroy();
    }
  }
}