import fs from '@ohos.file.fs';
import http from '@ohos.net.http';

import RNOHLogger from './RNOHLogger'

export default class JavaScriptLoader {
  private pathDir: string;

  public async loadBundle(uriString: string): Promise<string> {
    if (uriString.startsWith("http")) {
      return this.loadFromNetwork(uriString);
    } else {
      return this.loadFromFile(uriString);
    }
  }

  async loadFromFile(bundlePath: string): Promise<string> {
    const filePath = this.pathDir + bundlePath;
    
    const fileAccessible = await fs.access(filePath);

    if (!fileAccessible) {
      RNOHLogger.fatal("Bundle file not found: " + filePath);
    }

    const file = await fs.open(filePath, fs.OpenMode.READ_ONLY);
    try {
      const bundle = await fs.readText(bundlePath);

      return bundle;
    } finally {
      fs.closeSync(file)
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