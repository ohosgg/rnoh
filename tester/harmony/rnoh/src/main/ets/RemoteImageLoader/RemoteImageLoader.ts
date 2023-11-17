import http from '@ohos.net.http'
import image from '@ohos.multimedia.image'
import type { RemoteImageMemoryCache } from "./RemoteImageCache"
import { RemoteImageLoaderError } from "./RemoteImageLoaderError"
import request from '@ohos.request'
import type common from '@ohos.app.ability.common'
import type { RemoteImageDiskCache } from './RemoteImageDiskCache'
import fs from '@ohos.file.fs';

export class RemoteImageLoader {
  public constructor(
    private memoryCache: RemoteImageMemoryCache,
    private diskCache: RemoteImageDiskCache,
    private context: common.UIAbilityContext) {
  }

  public async getImageSource(uri: string): Promise<image.ImageSource> {
    if (this.memoryCache.has(uri)) {
      return this.memoryCache.get(uri)
    }
    if (this.diskCache.has(uri)) {
      const imageSource = image.createImageSource(this.diskCache.get(uri))
      if (imageSource === null) {
        throw new RemoteImageLoaderError("Couldn't create ImageSource")
      };
      return imageSource
    }
    const reqManager = http.createHttp()
    let response;
    try {
      response = await reqManager.request(uri)
    } catch (e) {
      throw new RemoteImageLoaderError(e.message ?? "Failed to fetch the image")
    }
    if (!(response.responseCode === http.ResponseCode.OK)) {
      throw new RemoteImageLoaderError('Failed to fetch the image');
    }
    if (response.result instanceof ArrayBuffer) {
      const imageSource = image.createImageSource(response.result)
      if (imageSource === null) {
        throw new RemoteImageLoaderError("Couldn't create ImageSource")
      }
      this.memoryCache.set(uri, imageSource)
      // NOTE: workaround for `Image` component not supporting redirects or ImageSource sources.
      // If the image is an animated GIF, we cannot convert it to a PixelMap
      // since that would display a single frame only.
      // Instead, when redirected, we attach the `location` url to the imageSource object
      // and use it as the source parameter for `Image`
      imageSource['location'] = response.header['location']
      return imageSource
    } else {
      throw new RemoteImageLoaderError("Unsupported response result type: " + response.resultType)
    }
  }

  public async prefetch(uri: string): Promise<boolean> {
    const reg = /[^a-zA-Z0-9 -]/g;
    const path = `${this.context.cacheDir}/${uri.replace(reg, '')}`;
    try {
      await request.downloadFile(this.context, { url: uri, filePath: path });
      this.diskCache.set(uri, `file://${path}`);
    } catch (e) {
      // if we want to prefetch the same file again it needs to be manually deleted first,
      // as request.downloadFile does not allow overwriting
      if(e.code === request.EXCEPTION_FILEPATH) {
        try {
          await fs.unlink(path);
          await request.downloadFile(this.context, { url: uri, filePath: path });
          this.diskCache.set(uri, `file://${path}`)
        } catch (e1) {
          return Promise.reject("Failed to fetch the image")
        }
      } else {
        return Promise.reject("Failed to fetch the image")
      }
    }
    
    return true
  }

  public getImageFromCache(uri: string): string | undefined {
    if (this.diskCache.has(uri)) {
      return this.diskCache.get(uri)
    }

    return undefined;
  }
}