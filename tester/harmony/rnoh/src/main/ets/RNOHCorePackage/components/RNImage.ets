import { RemoteImageLoaderError } from '../../RemoteImageLoader/RemoteImageLoaderError';
import { ColorSegments, Descriptor, getTintColorMatrix, RNOHContext } from '../../RNOH';
import { ImageLoaderTurboModule } from '../turboModules/ImageLoaderTurboModule';
import { RNViewBase, ViewBaseProps, ViewDescriptorWrapperBase, ViewRawProps } from './RNViewBase';

export interface ImageProps extends ViewBaseProps {
  uri: string,
  resizeMode: number,
  tintColor?: ColorSegments,
  blurRadius: number
}

interface ImageRawProps extends ViewRawProps{
  alt: string
  resizeMethod: string
}

interface ImageOnCompleteEvent {
  width: number;
  height: number;
  componentWidth: number;
  componentHeight: number;
  loadingStatus: number;
  contentWidth: number;
  contentHeight: number;
  contentOffsetX: number;
  contentOffsetY: number;
}

interface ImageOnErrorEvent {
  componentWidth: number;
  componentHeight: number;
  message?: string;
}

export interface ImageState {}


export type ImageDescriptor = Descriptor<"Image", ImageProps, ImageState, ImageRawProps>;
class ImageDescriptorWrapper extends ViewDescriptorWrapperBase<"Image", ImageProps, ImageState, ImageRawProps> {
}

class ImageSourceHolder {
  public source: string | Resource | PixelMap

  constructor(source: string | Resource | PixelMap) {
    this.source = source
  }
}

@Component
export struct RNImage {
  ctx!: RNOHContext
  tag: number = 0
  @State descriptor: ImageDescriptor = Object() as ImageDescriptor
  @State descriptorWrapper: ImageDescriptorWrapper | undefined = undefined

  // workaround: `@State` fields cannot be unions of primitive (`string`) and object (`Resource`, `PixelMap`) types
  @State imageSource: ImageSourceHolder | undefined = undefined
  defaultColorFilter: number[] = [
    1, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 0, 1, 0,
  ]
  private unregisterDescriptorChangesListener?: () => void = undefined

  aboutToAppear() {
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor<ImageDescriptor>(this.tag)
    this.descriptorWrapper = new ImageDescriptorWrapper(this.descriptor)
    this.onLoadStart();
    this.updateImageSource();
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        const newImageDescriptor = (newDescriptor as ImageDescriptor);
        const uriChanged = newImageDescriptor.props.uri !== this.descriptor.props.uri;
        this.descriptor = newImageDescriptor;
        if (uriChanged) {
          this.onLoadStart();
          this.updateImageSource();
        }
      }
    )
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
  }

  updateImageSource() {
    const uri = this.descriptor.props.uri;
    if (uri.startsWith("asset://")) {
      this.imageSource = new ImageSourceHolder($rawfile(uri.replace("asset://", "assets/")));
      return;
    }
    if (uri.startsWith("data:")) {
      this.imageSource = new ImageSourceHolder(uri);
      return;
    }
    const imageLoader = this.ctx.rnInstance.getTurboModule<ImageLoaderTurboModule>("ImageLoader");
    this.imageSource = undefined;
    imageLoader.getImageSource(uri).then(async (imageSource) => {
      const frameCounter = await imageSource.getFrameCount();
      if (frameCounter === 1) {
        // use the downloaded or cached image source
        this.imageSource = new ImageSourceHolder(await imageSource.createPixelMap());
      } else {
        // an animated GIF
        this.imageSource = new ImageSourceHolder(imageSource['location'] ?? uri)
      }
    }).catch((error: RemoteImageLoaderError) => {
      // fallback to passing uri to the Image component
      this.imageSource = new ImageSourceHolder(uri);
    })
    return;
  }

  /*
  * enum class ImageResizeMode {
  *   Cover,
  *   Contain,
  *   Stretch,
  *   Center,
  *   Repeat
  * }
   */
  getResizeMode(resizeMode: number) {
    switch(resizeMode) {
      case 0:
        return ImageFit.Cover;
      case 1:
        return ImageFit.Contain;
      case 2:
        return ImageFit.Fill;
      case 3:
      case 4:
        return ImageFit.None;
      default:
        return ImageFit.Cover;
    }
  }

  onLoadStart() {
    this.ctx.rnInstanceManager.emitComponentEvent(
      this.descriptor.tag,
      "loadStart",
      null
    )
  }

  onLoad(event?: ImageOnCompleteEvent) {
    if (this.imageSource !== undefined && event) {
      this.ctx.rnInstance.emitComponentEvent(this.descriptor.tag, "load", {
        width: event.width,
        height: event.height,
        uri: this.descriptor.props.uri,
      })
    }
  }

  dispatchOnError(message?: string) {
    const errorMessage = message ? message : "Failed to load the image";
    this.ctx.rnInstance.emitComponentEvent(this.descriptor.tag, "error", errorMessage)
  }

  getColorFilter(): number[] {
    if (!this.descriptor.props.tintColor || this.descriptor.props.tintColor.every((element) => element === 0)) {
      return this.defaultColorFilter;
    }

    return getTintColorMatrix(this.descriptor.props.tintColor)
  }

  build() {
    RNViewBase({
      ctx: this.ctx,
      tag: this.tag,
    }) {
      // NOTE: this ensures we switch the image source, even if the new source is bad.
      // ArkUI keeps displaying the last "good" image when the passed source parameter changes
      if (this.imageSource !== undefined) {
        Image(this.imageSource.source)
          .accessibilityText(this.descriptor.rawProps.alt)
          .interpolation(ImageInterpolation.High)
          .width("100%")
          .height("100%")
          .autoResize(this.descriptor.rawProps.resizeMethod!=='scale')
          .objectFit(this.getResizeMode(this.descriptor.props.resizeMode))
          .objectRepeat(this.descriptor.props.resizeMode === 4 ?
          ImageRepeat.XY : ImageRepeat.NoRepeat)
          .colorFilter(this.getColorFilter())
          .blur(this.descriptor.props.blurRadius)
          .onComplete(event => this.onLoad(event))
          .onError((event: ImageOnErrorEvent) => {
            if (this.imageSource !== undefined) {
              this.dispatchOnError(event.message)
            }
            this.imageSource = undefined;
          })
      }
    }
  }
}