import { RemoteImageCache } from './RemoteImageCache';
import fs from '@ohos.file.fs';

export class RemoteImageDiskCache extends RemoteImageCache<string> {

  remove(key: string): void {
    if (this.data.has(key)) {
      const value = this.data.get(key);
      fs.unlink(value).catch((reason) => {
        throw new Error("Cache file was not deleted " + reason);
      })
      this.data.delete(key);
    }
  }

  clear(): void {
    this.data.forEach((value) => {
      fs.unlink(value).catch((reason) => {
        throw new Error("Cache file was not deleted " + reason);
      })
    })
    this.data.clear();
  }
}