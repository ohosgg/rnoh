import rnoh from 'librnoh.so'
import { ColorSegments, Descriptor, Tag } from './descriptor'
import { DescriptorRegistry } from './DescriptorRegistry'
import { ReactEventKind } from './events'
import { convertColorSegmentsToString } from './cpp-bridge-utils'
import { ViewProps } from './RNView'

export type ImageProps = ViewProps & {
  uri: string
}

export type ImageDescriptor = Descriptor<"Image", ImageProps>

@Component
export struct RNImage {
  @State tag: number = -1
  @Link descriptorRegistry: DescriptorRegistry

  getDescriptor() {
    return this.descriptorRegistry.getDescriptor<ImageDescriptor>(this.tag)
  }

  onTouchEvent(event: TouchEvent) {
    rnoh?.emitEvent(this.getDescriptor().tag, ReactEventKind.TOUCH, event)
  }

  build() {
    Image(this.getDescriptor().props.uri)
      .interpolation(ImageInterpolation.High)
      .width(this.getDescriptor().props.width)
      .height(this.getDescriptor().props.height)
      .position({ y: this.getDescriptor().props.top, x: this.getDescriptor().props.left })
      .backgroundColor(convertColorSegmentsToString(this.getDescriptor().props.backgroundColor))
      .borderWidth(this.getDescriptor().props.borderWidth)
      .borderColor(convertColorSegmentsToString(this.getDescriptor().props.borderColor))
      .borderRadius(this.getDescriptor().props.borderRadius)
      .onTouch((event) => this.onTouchEvent(event))
  }
}