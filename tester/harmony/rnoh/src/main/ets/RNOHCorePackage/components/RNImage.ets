import { Descriptor, RNOHContext } from '../../RNOH'
import { RNViewBase, ViewBaseProps } from './RNViewBase'

export type ImageProps = ViewBaseProps & {
  uri: string
}

export type ImageDescriptor = Descriptor<"Image", ImageProps>

@Component
export struct RNImage {
  ctx: RNOHContext
  tag: number
  @State descriptor: ImageDescriptor = {} as ImageDescriptor
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

  build() {
    RNViewBase({
      ctx: this.ctx,
      tag: this.tag,
    }) {
      Image(this.getSource())
        .interpolation(ImageInterpolation.High)
        .width("100%")
        .height("100%")
    }
  }
}