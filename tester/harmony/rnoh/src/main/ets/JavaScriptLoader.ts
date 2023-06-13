import http from '@ohos.net.http';
import util from '@ohos.util';
import resmgr from "@ohos.resourceManager";

import RNOHLogger from './RNOHLogger'
import { RNAbility } from './RNAbility';

export default class JavaScriptLoader {
  constructor(private resourceManager: resmgr.ResourceManager) {
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
      RNOHLogger.fatal("Failed to load local bundle: " + bundlePath);
      throw err;
    }
  }

  async loadFromNetwork(uriString: string): Promise<string> {
    const httpRequest = http.createHttp();
    try {
      RNOHLogger.info('loading bundle ' + uriString)
      const data = await httpRequest.request(
        uriString,
        {
          header: {
            'Content-Type': 'text/javascript'
          },
        }
      );
      RNOHLogger.info('code:' + data.responseCode);
      RNOHLogger.info('header:' + JSON.stringify(data.header));
      RNOHLogger.info('cookies:' + data.cookies);
      return data.result as string;
    } catch (err) {
      RNOHLogger.error('Bundle load error: ' + JSON.stringify(err));
      throw err;
    } finally {
      httpRequest.destroy();
    }
  }
}