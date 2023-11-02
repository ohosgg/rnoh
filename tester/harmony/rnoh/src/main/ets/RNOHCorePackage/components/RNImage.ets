import { ColorSegments, Descriptor, getTintColorMatrix, RNOHContext } from '../../RNOH';
import { ImageLoaderTurboModule } from '../turboModules/ImageLoaderTurboModule';
import { RNViewBase, ViewBaseProps } from './RNViewBase';

export interface ImageProps extends ViewBaseProps {
  uri: string,
  resizeMode: number,
  tintColor?: ColorSegments,
  blurRadius: number
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

export type ImageDescriptor = Descriptor<"Image", ImageProps>

@Component
export struct RNImage {
  ctx!: RNOHContext
  tag: number = 0
  @State descriptor: ImageDescriptor = Object() as ImageDescriptor
  @State imageSource: Resource | PixelMap | undefined = undefined
  defaultColorFilter: number[] = [
    1, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 0, 1, 0,
  ]
  private unregisterDescriptorChangesListener?: () => void = undefined

  aboutToAppear() {
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor<ImageDescriptor>(this.tag)
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
      this.imageSource = $rawfile(uri.replace("asset://", "assets/"));
      return;
    }
    const imageLoader = this.ctx.rnInstance.getTurboModule<ImageLoaderTurboModule>("ImageLoader");
    this.imageSource = undefined;
    imageLoader.getImageSource(uri).then(async (imageSource) => {
      this.imageSource = await imageSource.createPixelMap();
    });
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

  onLoad(event: ImageOnCompleteEvent) {
    if (this.imageSource !== undefined) {
      this.ctx.rnInstance.emitComponentEvent(this.descriptor.tag, "load", {
        width: event.width,
        height: event.height,
        uri: this.descriptor.props.uri,
      })
    }
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
      Image(this.imageSource)
        .interpolation(ImageInterpolation.High)
        .width("100%")
        .height("100%")
        .objectFit(this.getResizeMode(this.descriptor.props.resizeMode))
        .objectRepeat(this.descriptor.props.resizeMode === 4 ?
        ImageRepeat.XY : ImageRepeat.NoRepeat)
        .colorFilter(this.getColorFilter())
        .blur(this.descriptor.props.blurRadius)
        .onComplete(event => this.onLoad(event));
    }
  }
}