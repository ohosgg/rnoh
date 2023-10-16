import { ColorSegments, Descriptor} from '../../RNOH';
import { getTintColorMatrix, RNOHContext } from '../../RNOH'
import { ImageLoaderTurboModule } from '../turboModules/ImageLoaderTurboModule'
import { ViewBaseProps } from './RNViewBase';
import { RNViewBase } from './RNViewBase'

export interface ImageProps extends ViewBaseProps {
  uri: string,
  resizeMode: number,
  tintColor?: ColorSegments,
  blurRadius: number
}

export type ImageDescriptor = Descriptor<"Image", ImageProps>

@Component
export struct RNImage {
  ctx!: RNOHContext
  tag: number = 0
  @State descriptor: ImageDescriptor = {} as ImageDescriptor
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
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        const newImageDescriptor = (newDescriptor as ImageDescriptor);
        if(newImageDescriptor.props.uri !== this.descriptor.props.uri) {
          this.onLoadStart();
        }
        this.descriptor = newImageDescriptor;
      }
    )
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
  }

  getSource() {
    const uri = this.descriptor.props.uri
    if (uri.startsWith("asset://")) {
      return $rawfile(uri.replace("asset://", "assets/"));
    }
    const filePath =
      this.ctx.rnInstanceManager.getTurboModule<ImageLoaderTurboModule>("ImageLoader")
        .getCachedImage(uri)
    return filePath ?? uri
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

  getColorFilter() {
    if (!this.descriptor.props.tintColor || this.descriptor.props.tintColor.every((element) => element === 0)){
      return this.defaultColorFilter;
    }

    return getTintColorMatrix(this.descriptor.props.tintColor)
  }

  build() {
    RNViewBase({
      ctx: this.ctx,
      tag: this.tag,
    }) {
      Image(this.getSource())
        .interpolation(ImageInterpolation.High)
        .width("100%")
        .height("100%")
        .objectFit(this.getResizeMode(this.descriptor.props.resizeMode))
        .objectRepeat(this.descriptor.props.resizeMode === 4 ?
        ImageRepeat.XY : ImageRepeat.NoRepeat )
        .colorFilter(this.getColorFilter())
        .blur(this.descriptor.props.blurRadius)
    }
  }
}