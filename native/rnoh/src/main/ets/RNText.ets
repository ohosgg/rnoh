import rnoh from 'librnoh.so'
import { ColorSegments, Descriptor, LayoutProps, Tag } from './descriptor'
import { DescriptorRegistry } from './DescriptorRegistry'
import { ReactEventKind } from './events'
import { convertColorSegmentsToString } from './cpp-bridge-utils'
import { ViewProps } from './RNView'

export type TextProps = ViewProps & {
  text?: string
  fontColor?: ColorSegments
  fontWeight?: number
  fontSize?: number
}

export type TextDescriptor = Descriptor<"Paragraph", TextProps>

@Component
export struct RNText {
  @State tag: number = -1
  @Link descriptorRegistry: DescriptorRegistry

  getDescriptor() {
    return this.descriptorRegistry.getDescriptor<TextDescriptor>(this.tag)
  }

  onTouchEvent(event: TouchEvent) {
    rnoh?.emitEvent(this.getDescriptor().tag, ReactEventKind.TOUCH, event)
  }

  build() {
    Text(this.getDescriptor().props.text)
      .width(this.getDescriptor().props.width)
      .height(this.getDescriptor().props.height)
      .position({ y: this.getDescriptor().props.top, x: this.getDescriptor().props.left })
      .fontColor(convertColorSegmentsToString(this.getDescriptor().props.fontColor))
      .fontWeight(this.getDescriptor().props.fontWeight)
      .fontSize(this.getDescriptor().props.fontSize)
      .onTouch((event) => this.onTouchEvent(event))
  }
}