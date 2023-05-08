import { ColorSegments, Descriptor, Tag } from './descriptor'
import { DescriptorRegistry } from './DescriptorRegistry'
import { ReactEventKind } from './events'
import { convertColorSegmentsToString } from './cpp-bridge-utils'
import { ViewProps } from './RNView'
import { RNInstance } from "./RNInstance"

export type ImageProps = ViewProps & {
  uri: string
}

export type ImageDescriptor = Descriptor<"Image", ImageProps>

@Component
export struct RNImage {
  @Consume("RNInstance") rnInstance: RNInstance
  @State tag: number = -1
  @Prop descriptor: ImageDescriptor

  onTouchEvent(event: TouchEvent) {
    this.rnInstance.emitEvent(this.descriptor.tag, ReactEventKind.TOUCH, event)
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