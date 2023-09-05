import { ColorSegments, Descriptor, getTintColorMatrix, RNOHContext } from '../../RNOH'
import { RNViewBase, ViewBaseProps } from './RNViewBase'

export type ImageProps = ViewBaseProps & {
  uri: string,
  resizeMode: number,
  tintColor?: ColorSegments
}

export type ImageDescriptor = Descriptor<"Image", ImageProps>

@Component
export struct RNImage {
  ctx: RNOHContext
  tag: number
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
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.descriptor = (newDescriptor as ImageDescriptor)
      }
    )
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
  }

  getSource() {
    if (this.descriptor.props.uri.startsWith("asset://")) {
      return this.descriptor.props.uri.replace("asset://", "/assets/");
    }
    return this.descriptor.props.uri
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
        .colorFilter(this.descriptor.props.tintColor.every((element) => element === 0)
          ? this.defaultColorFilter
          : getTintColorMatrix(this.descriptor.props.tintColor))
    }
  }
}