import { Descriptor } from '../../RNOH/DescriptorBase'
import { convertColorSegmentsToString } from '../../RNOH'
import { ViewProps, handleTouchEvent } from './RNView'
import { RNOHContext } from '../../RNOH/RNOHContext'

export type ImageProps = ViewProps & {
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

  onTouchEvent(e: TouchEvent) {
    handleTouchEvent(this.ctx, e, this.tag)
  }

  getSource() {
    if (this.descriptor.props.uri.startsWith("asset://")) {
      return this.descriptor.props.uri.replace("asset://", "/assets/");
    }
    return this.descriptor.props.uri
  }

  build() {
    Image(this.getSource())
      .interpolation(ImageInterpolation.High)
      .width(this.descriptor.props.width)
      .height(this.descriptor.props.height)
      .position({ y: this.descriptor.props.top, x: this.descriptor.props.left })
      .backgroundColor(convertColorSegmentsToString(this.descriptor.props.backgroundColor))
      .borderWidth(this.descriptor.props.borderWidth)
      .borderColor(convertColorSegmentsToString(this.descriptor.props.borderColor))
      .borderRadius(this.descriptor.props.borderRadius)
      .onTouch((event) => this.onTouchEvent(event))
  }
}