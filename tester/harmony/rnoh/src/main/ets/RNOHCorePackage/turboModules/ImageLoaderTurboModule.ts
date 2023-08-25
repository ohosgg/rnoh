import { TurboModule, TurboModuleContext } from '../../RNOH/TurboModule';
import { RemoteImageCache, RemoteImageLoader } from "../../RemoteImageLoader"

export class ImageLoaderTurboModule extends TurboModule {
  static NAME = "ImageLoader" as const

  private imageLoader: RemoteImageLoader

  constructor(protected ctx: TurboModuleContext) {
    super(ctx)
    this.imageLoader = new RemoteImageLoader(new RemoteImageCache(128))
  }

  public getConstants() {
    return {}
  }

  public async getSize(uri: string): Promise<number[]> {
    const imageSource = await this.imageLoader.getImageSource(uri)
    const imageInfo = await imageSource.getImageInfo()
    return [imageInfo.size.width, imageInfo.size.height]
  }

  public getSizeWithHeaders(uri: string, headers: Object): Promise<{
    width: number,
    height: number
  } & Record<string, any>> {
    this.ctx.logger.warn("ImageLoader::getSizeWithHeaders is not supported")
    return Promise.resolve({ width: 0, height: 0 })
  }

  public prefetchImage(uri: string): Promise<boolean> {
    this.ctx.logger.warn("ImageLoader::prefetchImage is not supported")
    return Promise.resolve(false)
  }

  public prefetchImageWithMetadata(uri: string, queryRootName: string, rootTag: number): Promise<boolean> {
    this.ctx.logger.warn("ImageLoader::prefetchImageWithMetadata is not supported")
    return Promise.resolve(false)
  }

  public queryCache(uris: Array<string>): Promise<Object> {
    this.ctx.logger.warn("ImageLoader::queryCache is not supported")
    return Promise.resolve({})
  }
}