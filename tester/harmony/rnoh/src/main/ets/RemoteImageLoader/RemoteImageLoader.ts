import http from '@ohos.net.http'
import image from '@ohos.multimedia.image'
import { RemoteImageCache } from "./RemoteImageCache"
import { RemoteImageLoaderError } from "./RemoteImageLoaderError"

export class RemoteImageLoader {
  public constructor(private cache: RemoteImageCache) {
  }

  public async getImageSource(uri: string): Promise<image.ImageSource> {
    const reqManager = http.createHttp()
    const response = await reqManager.request(uri)
    if (this.cache.has(uri)) {
      return this.cache.get(uri)
    }
    if (!(response.responseCode === http.ResponseCode.OK)) {
      throw new RemoteImageLoaderError('Failed to fetch the image');
    }
    if (response.result instanceof ArrayBuffer) {
      const imageSource = image.createImageSource(response.result)
      if (imageSource === null) {
        throw new RemoteImageLoaderError("Couldn't create ImageSource")
      }
      this.cache.set(uri, imageSource)
      return imageSource
    } else {
      throw new RemoteImageLoaderError("Unsupported response result type: " + response.resultType)
    }
  }
}